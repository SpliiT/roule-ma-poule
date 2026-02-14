import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendStatusUpdate } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';
import { z } from 'zod';
const updateInterventionSchema = z.object({
    technicianId: z.string().optional(),
    status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
    technicianNotes: z.string().optional(),
});
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
            include: { forfait: { select: { name: true } } },
        });
        if (!currentIntervention) {
            return NextResponse.json({ error: 'Intervention introuvable' }, { status: 404 });
        }
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
        if (newStatus !== currentIntervention.status) {
            await prisma.interventionStatusHistory.create({
                data: {
                    interventionId: id,
                    status: newStatus as any,
                    notes: `Mise à jour par l'administrateur${validatedData.technicianId ? ' (Assignation technicien)' : ''}`,
                },
            });
            await prisma.notification.create({
                data: {
                    userId: currentIntervention.clientId,
                    type: 'BOOKING_STATUS_CHANGED',
                    title: 'Statut de votre intervention mis à jour',
                    message: `Votre intervention pour le forfait "${currentIntervention?.forfait.name || id}" est désormais ${newStatus === 'CONFIRMED' ? 'confirmée' : newStatus === 'CANCELLED' ? 'annulée' : newStatus === 'IN_PROGRESS' ? 'en cours' : newStatus === 'COMPLETED' ? 'terminée' : newStatus}.`,
                    data: { interventionId: id, status: newStatus },
                },
            });
            
            await sendPushNotification(currentIntervention.clientId, {
                title: 'Statut mis à jour 🚲',
                body: `Votre intervention est désormais ${newStatus === 'CONFIRMED' ? 'confirmée' : newStatus === 'CANCELLED' ? 'annulée' : newStatus === 'IN_PROGRESS' ? 'en cours' : newStatus === 'COMPLETED' ? 'terminée' : newStatus}.`,
                data: { interventionId: id, url: `/dashboard` }
            });

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
                
                await sendPushNotification(validatedData.technicianId, {
                    title: 'Nouvelle mission ! 🛠️',
                    body: `Une intervention à ${currentIntervention.city} vous a été assignée.`,
                    data: { interventionId: id, url: `/technician` }
                });
            }
        }
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
