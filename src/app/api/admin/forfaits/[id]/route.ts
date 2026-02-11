import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const updateForfaitSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    duration: z.number().int().positive().optional(),
    price: z.number().positive().optional(),
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
        const data = updateForfaitSchema.parse(body);
        const forfait = await prisma.forfait.update({
            where: { id },
            data,
        });
        return NextResponse.json({ data: forfait });
    } catch (error) {
        console.error('PATCH forfait error:', error);
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
        await prisma.forfait.update({
            where: { id },
            data: { isActive: false },
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE forfait error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}