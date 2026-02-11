import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createForfaitSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    description: z.string().min(1, 'Description requise'),
    duration: z.number().int().positive('Durée invalide'),
    price: z.number().positive('Le prix doit être positif'),
});

export async function GET() {
    try {
        const forfaits = await prisma.forfait.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });

        return NextResponse.json({ data: forfaits });
    } catch (error) {
        console.error('Erreur GET forfaits:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await requireRole('ADMIN');
        const body = await req.json();
        const data = createForfaitSchema.parse(body);

        const forfait = await prisma.forfait.create({
            data: {
                name: data.name,
                description: data.description,
                duration: data.duration,
                price: data.price,
                isActive: true,
            },
        });

        return NextResponse.json({ data: forfait }, { status: 201 });
    } catch (error) {
        console.error('POST forfait error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
