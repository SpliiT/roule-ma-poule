import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'TECHNICIEN' && user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Dans une version plus avancée, on filtrerait par technicianId === user.id
        // Pour le moment on renvoie toutes les interventions car c'est une démo
        const interventions = await prisma.intervention.findMany({
            include: {
                client: true,
                bike: true,
                forfait: true,
            },
            orderBy: { scheduledAt: 'asc' },
        });

        return NextResponse.json({ data: interventions });
    } catch (error) {
        console.error('Erreur GET technician interventions:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
