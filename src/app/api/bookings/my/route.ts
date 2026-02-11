import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const bookings = await prisma.intervention.findMany({
            where: { clientId: user.id },
            include: {
                bike: true,
                forfait: true,
            },
            orderBy: { scheduledAt: 'asc' },
        });

        return NextResponse.json({ data: bookings });
    } catch (error) {
        console.error('Erreur GET my bookings:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
