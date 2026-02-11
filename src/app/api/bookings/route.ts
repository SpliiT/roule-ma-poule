import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmation } from '@/lib/email';
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

        // 1. Récupérer le forfait (avec sa durée réelle)
        const forfait = await prisma.forfait.findUnique({
            where: { id: validatedData.forfaitId },
        });
        if (!forfait) return NextResponse.json({ error: 'Forfait introuvable' }, { status: 404 });

        // 2. Calcul du prix total : forfait + produits additionnels
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

        // 3. Vérification des conflits de créneau
        const scheduledAt = new Date(validatedData.scheduledAt);
        const duration = forfait.duration; // Durée réelle du forfait
        const scheduledEnd = new Date(scheduledAt.getTime() + duration * 60 * 1000);

        const conflictingIntervention = await prisma.intervention.findFirst({
            where: {
                scheduledAt: { lt: scheduledEnd },
                status: { not: 'CANCELLED' },
                AND: {
                    scheduledAt: {
                        gte: new Date(scheduledAt.getTime() - 180 * 60 * 1000), // fenêtre raisonnable
                    },
                },
            },
        });

        // Note: on vérifie coté technicien, pas côté client (le client peut réserver même si occupé)
        // La vérification plus précise est faite dans l'API /api/bookings/slots

        // 4. Affectation automatique du technicien via la zone
        let technicianId: string | null = null;
        let zoneId: string | null = null;

        // Chercher la zone contenant cette position
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
                // Vérification simplifiée avec le geometry GeoJSON
                const geometry = typeof zone.geometry === 'string' ? JSON.parse(zone.geometry) : zone.geometry as any;
                if (geometry && geometry.coordinates) {
                    const coords = geometry.coordinates[0]; // Premier anneau du polygone
                    if (isPointInPolygon(validatedData.latitude, validatedData.longitude, coords)) {
                        zoneId = zone.id;
                        // Trouver un technicien actif dans cette zone
                        const activeTech = zone.technicians.find((tz: any) => tz.technician?.isActive);
                        if (activeTech) {
                            technicianId = activeTech.technicianId;
                        }
                        break;
                    }
                }
            } catch { /* zone sans geometry valide */ }
        }

        // 5. Créer l'intervention avec la durée réelle et le prix total
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
                duration, // Durée du forfait (pas hardcodée à 60)
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

        // 6. Envoyer email de confirmation
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

/**
 * Ray-casting algorithme pour vérifier si un point est dans un polygone.
 */
function isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i][1], yi = polygon[i][0]; // GeoJSON = [lng, lat]
        const xj = polygon[j][1], yj = polygon[j][0];

        const intersect = ((yi > lng) !== (yj > lng)) &&
            (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
