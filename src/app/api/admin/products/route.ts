import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const createProductSchema = z.object({
    name: z.string().min(1, 'Nom requis'),
    description: z.string().optional(),
    price: z.number().positive('Le prix doit être positif'),
    stock: z.number().int().min(0).default(0),
    category: z.string().optional(),
    imageUrl: z.string().url().optional(),
});
export async function GET() {
    try {
        await requireRole('ADMIN');
        const products = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { interventionProducts: true } },
            },
        });
        return NextResponse.json({ data: products });
    } catch (error) {
        console.error('GET admin products error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
export async function POST(req: Request) {
    try {
        await requireRole('ADMIN');
        const body = await req.json();
        const data = createProductSchema.parse(body);
        const product = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description || null,
                price: data.price,
                stock: data.stock,
                category: data.category || null,
                imageUrl: data.imageUrl || null,
                isActive: true,
            },
        });
        return NextResponse.json({ data: product }, { status: 201 });
    } catch (error) {
        console.error('POST product error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}