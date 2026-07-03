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
        const client = await getCurrentUser();
        if (!client) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const payload = await req.json();
        const bookingRequest = bookingSchema.parse(payload);
        
        const selectedForfait = await prisma.forfait.findUnique({
            where: { id: bookingRequest.forfaitId },
        });
        
        if (!selectedForfait) {
            return NextResponse.json({ error: 'Forfait introuvable' }, { status: 404 });
        }

        let totalOrderPrice = Number(selectedForfait.price);
        const orderProducts: { productId: string; quantity: number; priceAtTime: number }[] = [];
        
        if (bookingRequest.products.length > 0) {
            const requestedProductIds = bookingRequest.products.map(p => p.productId);
            const availableProducts = await prisma.product.findMany({
                where: { id: { in: requestedProductIds }, isActive: true },
            });
            
            for (const item of bookingRequest.products) {
                const matchedProduct = availableProducts.find(p => p.id === item.productId);
                if (!matchedProduct) {
                    return NextResponse.json({ error: `Produit ${item.productId} introuvable ou inactif` }, { status: 404 });
                }
                const unitPrice = Number(matchedProduct.price);
                totalOrderPrice += unitPrice * item.quantity;
                orderProducts.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    priceAtTime: unitPrice,
                });
            }
        }

        const scheduledStartTime = new Date(bookingRequest.scheduledAt);
        const serviceDuration = selectedForfait.duration;
        const scheduledEndTime = new Date(scheduledStartTime.getTime() + serviceDuration * 60 * 1000);
        
        let assignedTechnicianId: string | null = null;
        let assignedZoneId: string | null = null;
        
        const activeZones = await prisma.zone.findMany({
            where: { isActive: true },
            include: {
                technicians: {
                    include: { technician: { select: { id: true, isActive: true } } },
                },
            },
        });
        
        for (const zone of activeZones) {
            try {
                const geometry = typeof zone.geometry === 'string' ? JSON.parse(zone.geometry) : zone.geometry as any;
                if (geometry && geometry.coordinates) {
                    const coords = geometry.coordinates[0];
                    if (isPointInPolygon(bookingRequest.latitude, bookingRequest.longitude, coords)) {
                        assignedZoneId = zone.id;
                        const availableTech = zone.technicians.find(tz => tz.technician?.isActive);
                        if (availableTech) {
                            assignedTechnicianId = availableTech.technicianId;
                        }
                        break;
                    }
                }
            } catch { }
        }

        if (!assignedTechnicianId) {
            const allActiveTechnicians = await prisma.user.findMany({
                where: { role: 'TECHNICIEN', isActive: true },
                include: {
                    addresses: { where: { isDefault: true } }
                }
            });

            let minDistance = Infinity;
            let closestTechId: string | null = null;

            for (const tech of allActiveTechnicians) {
                let techLat = tech.currentLat;
                let techLng = tech.currentLng;

                if (techLat === null || techLng === null) {
                    if (tech.addresses && tech.addresses.length > 0) {
                        techLat = tech.addresses[0].latitude;
                        techLng = tech.addresses[0].longitude;
                    }
                }

                if (techLat !== null && techLng !== null) {
                    const distanceToClient = getDistanceFromLatLonInKm(
                        bookingRequest.latitude, 
                        bookingRequest.longitude, 
                        techLat, 
                        techLng
                    );
                    if (distanceToClient < minDistance) {
                        minDistance = distanceToClient;
                        closestTechId = tech.id;
                    }
                }
            }

            if (closestTechId) {
                assignedTechnicianId = closestTechId;
            }
        }

        const newIntervention = await prisma.intervention.create({
            data: {
                clientId: client.id,
                bikeId: bookingRequest.bikeId,
                forfaitId: bookingRequest.forfaitId,
                technicianId: assignedTechnicianId,
                zoneId: assignedZoneId,
                address: bookingRequest.street,
                postalCode: bookingRequest.postalCode,
                city: bookingRequest.city,
                latitude: bookingRequest.latitude,
                longitude: bookingRequest.longitude,
                scheduledAt: scheduledStartTime,
                totalPrice: totalOrderPrice,
                duration: serviceDuration,
                status: 'PENDING',
                products: orderProducts.length > 0 ? {
                    createMany: {
                        data: orderProducts,
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

        const e2eEmail = process.env.E2E_MAIL;
        const isTestUser = e2eEmail ? client.email === e2eEmail : false;

        if (!isTestUser) {
            await sendPushNotification(client.id, {
                title: 'Réservation confirmée ! 📅',
                body: `Votre demande pour le forfait "${selectedForfait.name}" a bien été prise en compte.`,
                data: { interventionId: newIntervention.id, url: '/dashboard' }
            });

            await prisma.notification.create({
                data: {
                    userId: client.id,
                    type: 'BOOKING_CREATED',
                    title: 'Réservation enregistrée',
                    message: `Votre demande pour le forfait "${selectedForfait.name}" a bien été prise en compte.`,
                    data: { interventionId: newIntervention.id },
                },
            });
            
            try {
                const interventionWithDetails = await prisma.intervention.findUnique({
                    where: { id: newIntervention.id },
                    include: {
                        client: { select: { email: true, name: true } },
                        forfait: { select: { name: true } },
                    },
                });
                if (interventionWithDetails) {
                    await sendBookingConfirmation(interventionWithDetails as any);
                }
            } catch (emailError) {
                console.error('Email failed to send for intervention', newIntervention.id);
            }
        }
        
        return NextResponse.json({ data: newIntervention }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données de réservation invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Impossible de finaliser la réservation' }, { status: 500 });
    }
}

