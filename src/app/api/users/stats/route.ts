import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

        const [totalBookings, totalBikes] = await Promise.all([
            prisma.intervention.count({ where: { clientId: user.id } }),
            prisma.bike.count({ where: { userId: user.id } }),
        ]);

        return NextResponse.json({
            data: {
                totalBookings,
                totalBikes,
            }
        });
    } catch (error) {
        console.error('Erreur GET client stats:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
