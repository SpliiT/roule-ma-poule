import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendStatusUpdate } from '@/lib/email';
import { z } from 'zod';

const updateInterventionSchema = z.object({
    technicianId: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    technicianNotes: z.string().optional(),
});

/**
 * API pour mettre à jour une intervention spécifique (Admin uniquement).
 */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole('ADMIN');
        const { id } = await params;
        const body = await req.json();

        const validatedData = updateInterventionSchema.parse(body);

        const currentIntervention = await prisma.intervention.findUnique({
            where: { id },
        });

        if (!currentIntervention) {
            return NextResponse.json({ error: 'Intervention introuvable' }, { status: 404 });
        }

        // Si on assigne un technicien et que le statut est PENDING, on passe en CONFIRMED automatique
        const newStatus = validatedData.status ||
            (validatedData.technicianId && currentIntervention.status === 'PENDING' ? 'CONFIRMED' : currentIntervention.status);

        const updatedIntervention = await prisma.intervention.update({
            where: { id },
            data: {
                technicianId: validatedData.technicianId,
                status: newStatus as any,
                technicianNotes: validatedData.technicianNotes,
            },
        });

        // Historique de statut
        if (newStatus !== currentIntervention.status) {
            await prisma.interventionStatusHistory.create({
                data: {
                    interventionId: id,
                    status: newStatus as any,
                    notes: `Mise à jour par l'administrateur${validatedData.technicianId ? ' (Assignation technicien)' : ''}`,
                },
            });

            // Notification pour le client
            await prisma.notification.create({
                data: {
                    userId: currentIntervention.clientId,
                    type: 'BOOKING_STATUS_CHANGED',
                    title: 'Statut de votre intervention mis à jour',
                    message: `Votre intervention pour le forfait "${id}" est désormais ${newStatus}.`,
                    data: { interventionId: id, status: newStatus },
                },
            });

            // Notification pour le technicien si assigné
            if (validatedData.technicianId) {
                await prisma.notification.create({
                    data: {
                        userId: validatedData.technicianId,
                        type: 'INTERVENTION_ASSIGNED',
                        title: 'Nouvelle intervention assignée',
                        message: `Une nouvelle intervention à ${currentIntervention.city} vous a été assignée.`,
                        data: { interventionId: id },
                    },
                });
            }
        }

        // Envoyer email de changement de statut
        if (newStatus !== currentIntervention.status) {
            try {
                const fullIntervention = await prisma.intervention.findUnique({
                    where: { id },
                    include: {
                        client: { select: { email: true, name: true } },
                        forfait: { select: { name: true } },
                    },
                });
                if (fullIntervention) {
                    await sendStatusUpdate(fullIntervention as any);
                }
            } catch (emailError) {
                console.error('Erreur envoi email statut:', emailError);
            }
        }

        return NextResponse.json({ data: updatedIntervention });
    } catch (error) {
        console.error('PATCH intervention error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
