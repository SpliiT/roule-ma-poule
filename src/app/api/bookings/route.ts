import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { getDistanceFromLatLonInKm, isPointInPolygon } from '@/lib/utils';
import { z } from 'zod';
const bookingSchema = z.object({
    bikeId: z.string(),
    forfaitId: z.string(),
    scheduledAt: z.string(),
    street: z.string(),
    postalCode: z.string(),
    city: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    products: z.array(z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
    })).default([]),
});
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        const body = await req.json();
        const validatedData = bookingSchema.parse(body);
        const forfait = await prisma.forfait.findUnique({
            where: { id: validatedData.forfaitId },
        });
        if (!forfait) return NextResponse.json({ error: 'Forfait introuvable' }, { status: 404 });
        let totalPrice = Number(forfait.price);
        const productDetails: { productId: string; quantity: number; priceAtTime: number }[] = [];
        if (validatedData.products.length > 0) {
            const productIds = validatedData.products.map((p: { productId: string }) => p.productId);
            const dbProducts = await prisma.product.findMany({
                where: { id: { in: productIds }, isActive: true },
            });
            for (const item of validatedData.products) {
                const dbProduct = dbProducts.find((p: { id: string }) => p.id === item.productId);
                if (!dbProduct) {
                    return NextResponse.json({ error: `Produit ${item.productId} introuvable` }, { status: 404 });
                }
                const price = Number(dbProduct.price);
                totalPrice += price * item.quantity;
                productDetails.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtTime: price,
                });
            }
        }
        const scheduledAt = new Date(validatedData.scheduledAt);
        const duration = forfait.duration;
        const scheduledEnd = new Date(scheduledAt.getTime() + duration * 60 * 1000);
        const conflictingIntervention = await prisma.intervention.findFirst({
            where: {
                scheduledAt: { lt: scheduledEnd },
                status: { not: 'CANCELLED' },
                AND: {
                    scheduledAt: {
                        gte: new Date(scheduledAt.getTime() - 180 * 60 * 1000),
                    },
                },
            },
        });
        let technicianId: string | null = null;
        let zoneId: string | null = null;
        const allZones = await prisma.zone.findMany({
            where: { isActive: true },
            include: {
                technicians: {
                    include: { technician: { select: { id: true, isActive: true } } },
                },
            },
        });
        for (const zone of allZones) {
            try {
                const geometry = typeof zone.geometry === 'string' ? JSON.parse(zone.geometry) : zone.geometry as any;
                if (geometry && geometry.coordinates) {
                    const coords = geometry.coordinates[0];
                    if (isPointInPolygon(validatedData.latitude, validatedData.longitude, coords)) {
                        zoneId = zone.id;
                        const activeTech = zone.technicians.find((tz: any) => tz.technician?.isActive);
                        if (activeTech) {
                            technicianId = activeTech.technicianId;
                        }
                        break;
                    }
                }
            } catch { }
        }

        // Si l'intervention n'est pas dans une zone, trouver le technicien le plus proche
        if (!technicianId) {
            const allTechnicians = await prisma.user.findMany({
                where: { role: 'TECHNICIEN', isActive: true },
                include: {
                    addresses: { where: { isDefault: true } }
                }
            });

            let minDistance = Infinity;
            let closestTechId: string | null = null;

            for (const tech of allTechnicians) {
                let techLat = tech.currentLat;
                let techLng = tech.currentLng;

                if (techLat === null || techLng === null) {
                    if (tech.addresses && tech.addresses.length > 0) {
                        techLat = tech.addresses[0].latitude;
                        techLng = tech.addresses[0].longitude;
                    }
                }

                if (techLat !== null && techLng !== null) {
                    const d = getDistanceFromLatLonInKm(validatedData.latitude, validatedData.longitude, techLat, techLng);
                    if (d < minDistance) {
                        minDistance = d;
                        closestTechId = tech.id;
                    }
                }
            }

            if (closestTechId) {
                technicianId = closestTechId;
            }
        }

        const intervention = await prisma.intervention.create({
            data: {
                clientId: user.id,
                bikeId: validatedData.bikeId,
                forfaitId: validatedData.forfaitId,
                technicianId,
                zoneId,
                address: validatedData.street,
                postalCode: validatedData.postalCode,
                city: validatedData.city,
                latitude: validatedData.latitude,
                longitude: validatedData.longitude,
                scheduledAt,
                totalPrice,
                duration,
                status: 'PENDING',
                products: productDetails.length > 0 ? {
                    createMany: {
                        data: productDetails,
                    },
                } : undefined,
                statusHistory: {
                    create: {
                        status: 'PENDING',
                        notes: 'Réservation créée par le client',
                    },
                },
            },
        });

        
        await sendPushNotification(user.id, {
            title: 'Réservation confirmée ! 📅',
            body: `Votre demande pour le forfait "${forfait.name}" a bien été prise en compte.`,
            data: { interventionId: intervention.id, url: '/dashboard' }
        });

        await prisma.notification.create({
            data: {
                userId: user.id,
                type: 'BOOKING_CREATED',
                title: 'Réservation enregistrée',
                message: `Votre demande pour le forfait "${forfait.name}" a bien été prise en compte.`,
                data: { interventionId: intervention.id },
            },
        });
        try {
            const fullIntervention = await prisma.intervention.findUnique({
                where: { id: intervention.id },
                include: {
                    client: { select: { email: true, name: true } },
                    forfait: { select: { name: true } },
                },
            });
            if (fullIntervention) {
                await sendBookingConfirmation(fullIntervention as any);
            }
        } catch (emailError) {
            console.error('Erreur envoi email confirmation:', emailError);
        }
        return NextResponse.json({ data: intervention }, { status: 201 });
    } catch (error) {
        console.error('Erreur POST bookings:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

