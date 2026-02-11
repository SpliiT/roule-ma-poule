import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET() {
    try {
        await requireRole('ADMIN');
        const technicians = await prisma.user.findMany({
            where: {
                role: 'TECHNICIEN',
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return NextResponse.json({ data: technicians });
    } catch (error) {
        console.error('GET technicians error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}