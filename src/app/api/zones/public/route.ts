import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const zones = await prisma.zone.findMany({
            where: {
                isActive: true
            },
            select: {
                id: true,
                name: true,
                geometry: true,
                color: true
            }
        });

        return NextResponse.json({ data: zones });
    } catch (error) {
        console.error('Error fetching public zones:', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des zones' }, { status: 500 });
    }
}
