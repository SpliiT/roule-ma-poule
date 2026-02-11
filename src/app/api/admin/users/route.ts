import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET() {
    try {
        await requireRole('ADMIN');
        const users = await prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json({ data: users });
    } catch (error) {
        console.error('GET admin users error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}