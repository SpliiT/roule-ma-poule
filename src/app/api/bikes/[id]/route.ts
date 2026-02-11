import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bikeSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const body = await req.json();
        const validatedData = bikeSchema.partial().parse(body);

        const bike = await prisma.bike.update({
            where: { id: id, userId: user.id },
            data: validatedData,
        });

        return NextResponse.json({ data: bike });
    } catch (error) {
        console.error('Erreur PATCH bike:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        await prisma.bike.delete({
            where: { id: id, userId: user.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur DELETE bike:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
