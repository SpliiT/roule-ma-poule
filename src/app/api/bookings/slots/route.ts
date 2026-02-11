import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get('date');
        const zoneId = searchParams.get('zoneId');
        const duration = parseInt(searchParams.get('duration') || '60');

        if (!dateStr) {
            return NextResponse.json({ error: 'Paramètre "date" requis' }, { status: 400 });
        }

        const targetDate = new Date(dateStr);
        const now = new Date();
        const isToday = targetDate.toDateString() === now.toDateString();

        // 1. Définition de la plage horaire fixe (9h - 18h)
        const START_HOUR = 9;
        const END_HOUR = 18;
        const INTERVAL_MIN = 15;

        // 2. Récupération des interventions existantes pour vérifier la disponibilité
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);

        const bookedInterventions = await prisma.intervention.findMany({
            where: {
                scheduledAt: { gte: dayStart, lte: dayEnd },
                status: { not: 'CANCELLED' },
                ...(zoneId ? { zoneId } : {}),
            },
            select: { scheduledAt: true, duration: true },
        });

        const slots: { start: string; end: string; available: boolean }[] = [];

        // 3. Génération des créneaux
        for (let hour = START_HOUR; hour < END_HOUR; hour++) {
            for (let min = 0; min < 60; min += INTERVAL_MIN) {
                // Pas de créneau à 18h00 pile comme heure de début
                if (hour === 18) break;

                const slotStart = new Date(targetDate);
                slotStart.setHours(hour, min, 0, 0);

                // Contrainte : au moins 1 heure dans le futur
                const minTime = new Date(now.getTime() + 60 * 60 * 1000);

                if (slotStart < minTime && isToday) {
                    continue; // Trop tôt ou dans le passé
                }

                if (slotStart < now) {
                    continue; // Sécurité supplémentaire pour le passé
                }

                const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

                // On ne finit pas après 19h (optionnel, mais propre)
                if (slotEnd.getHours() > 19 || (slotEnd.getHours() === 19 && slotEnd.getMinutes() > 0)) {
                    // Note: On pourrait être plus strict sur 18h ici si on veut que TOUTE l'intervention finisse à 18h
                }

                const startStr = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                const endH = String(slotEnd.getHours()).padStart(2, '0');
                const endM = String(slotEnd.getMinutes()).padStart(2, '0');
                const endStr = `${endH}:${endM}`;

                const isBooked = bookedInterventions.some((intervention) => {
                    const bookedStart = new Date(intervention.scheduledAt).getTime();
                    const bookedEnd = bookedStart + intervention.duration * 60 * 1000;
                    const slotStartTime = slotStart.getTime();
                    const slotEndTime = slotEnd.getTime();
                    return slotStartTime < bookedEnd && slotEndTime > bookedStart;
                });

                slots.push({
                    start: startStr,
                    end: endStr,
                    available: !isBooked,
                });
            }
        }

        return NextResponse.json({ data: slots });
    } catch (error) {
        console.error('GET slots error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
