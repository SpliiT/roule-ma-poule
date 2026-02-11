import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const updatePlanningSchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    isActive: z.boolean().optional(),
});
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole('ADMIN');
        const { id } = await params;
        const body = await req.json();
        const data = updatePlanningSchema.parse(body);
        const planning = await prisma.planning.update({
            where: { id },
            data,
            include: { zone: { select: { id: true, name: true, color: true } } },
        });
        return NextResponse.json({ data: planning });
    } catch (error) {
        console.error('PATCH planning error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole('ADMIN');
        const { id } = await params;
        await prisma.planning.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE planning error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}