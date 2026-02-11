import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
    role: z.enum(['CLIENT', 'TECHNICIEN', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
});

/**
 * GET — Détail complet d'un utilisateur (Admin uniquement)
 */
export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole('ADMIN');
        const { id } = await params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                bikes: true,
                addresses: true,
                clientInterventions: {
                    include: {
                        forfait: { select: { name: true, price: true } },
                        technician: { select: { name: true } },
                        zone: { select: { name: true } },
                    },
                    orderBy: { scheduledAt: 'desc' },
                    take: 50,
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ data: user });
    } catch (error) {
        console.error('GET admin user detail error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}

/**
 * API pour mettre à jour un utilisateur (Admin uniquement).
 */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole('ADMIN');
        const { id } = await params;
        const body = await req.json();

        const validatedData = updateUserSchema.parse(body);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: validatedData,
        });

        return NextResponse.json({ data: updatedUser });
    } catch (error) {
        console.error('PATCH admin user error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
