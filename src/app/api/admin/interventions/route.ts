import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/interventions — list all interventions.
 * POST /api/admin/interventions — create a new intervention from admin panel.
 */
export async function GET() {
    try {
        await requireRole('ADMIN');
        const interventions = await prisma.intervention.findMany({
            include: {
                client: { select: { id: true, name: true, email: true } },
                technician: { select: { id: true, name: true, email: true } },
                forfait: { select: { id: true, name: true, price: true, duration: true } },
                zone: { select: { id: true, name: true } },
                bike: { select: { id: true, brand: true, model: true } },
            },
            orderBy: { scheduledAt: 'desc' },
        });
        return NextResponse.json({ data: interventions });
    } catch (error) {
        console.error('GET admin interventions error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await requireRole('ADMIN');
        const body = await req.json();
        const {
            clientId,
            technicianId,
            forfaitId,
            bikeId,
            address,
            addressComplement,
            postalCode,
            city,
            latitude,
            longitude,
            scheduledAt,
            clientNotes,
        } = body;

        if (!clientId || !forfaitId || !bikeId || !address || !postalCode || !city || !scheduledAt) {
            return NextResponse.json(
                { error: 'Champs obligatoires manquants (client, forfait, vélo, adresse, date)' },
                { status: 400 }
            );
        }

        // Get forfait to calculate price and duration
        const forfait = await prisma.forfait.findUnique({ where: { id: forfaitId } });
        if (!forfait) {
            return NextResponse.json({ error: 'Forfait introuvable' }, { status: 404 });
        }

        const intervention = await prisma.intervention.create({
            data: {
                clientId,
                technicianId: technicianId || null,
                forfaitId,
                bikeId,
                address,
                addressComplement: addressComplement || null,
                postalCode,
                city,
                latitude: latitude || 0,
                longitude: longitude || 0,
                scheduledAt: new Date(scheduledAt),
                duration: forfait.duration,
                totalPrice: forfait.price,
                status: technicianId ? 'CONFIRMED' : 'PENDING',
                clientNotes: clientNotes || null,
            },
            include: {
                client: { select: { id: true, name: true, email: true } },
                technician: { select: { id: true, name: true } },
                forfait: { select: { id: true, name: true } },
                bike: { select: { id: true, brand: true, model: true } },
            },
        });

        return NextResponse.json({ data: intervention });
    } catch (error) {
        console.error('POST admin intervention error:', error);
        return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }
}
