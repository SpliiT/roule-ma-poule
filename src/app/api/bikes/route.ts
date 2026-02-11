import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bikeSchema } from '@/lib/validations/auth';
import { z } from 'zod';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const bikes = await prisma.bike.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ data: bikes });
    } catch (error) {
        console.error('Erreur lors de la récupération des vélos:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = bikeSchema.parse(body);

        const bike = await prisma.bike.create({
            data: {
                ...validatedData,
                userId: user.id,
            },
        });

        return NextResponse.json({ data: bike }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        console.error("Erreur lors de la création du vélo:", error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
