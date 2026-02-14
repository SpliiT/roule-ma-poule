import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const rateSchema = z.object({
    rating: z.number().int().min(1).max(5),
    ratingComment: z.string().optional(),
});

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { rating, ratingComment } = rateSchema.parse(body);

        const intervention = await prisma.intervention.findUnique({
            where: { id },
        });

        if (!intervention) {
            return NextResponse.json({ error: 'Intervention introuvable' }, { status: 404 });
        }

        if (intervention.clientId !== user.id) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
        }

        if (intervention.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'L\'intervention doit être terminée pour être notée' }, { status: 400 });
        }

        const updated = await prisma.intervention.update({
            where: { id },
            data: {
                rating,
                ratingComment,
            },
        });

        
        if (intervention.technicianId) {
            await prisma.notification.create({
                data: {
                    userId: intervention.technicianId,
                    type: 'RATING_RECEIVED',
                    title: 'Nouvelle note reçue',
                    message: `Un client a noté votre intervention du ${intervention.scheduledAt.toLocaleDateString('fr-FR')}.`,
                    data: { interventionId: id, rating },
                },
            });
        }

        return NextResponse.json({ data: updated });
    } catch (error) {
        console.error('POST rate intervention error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
