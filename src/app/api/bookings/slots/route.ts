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
        const dayOfWeek = targetDate.getDay(); 
        const whereClause: any = {
            dayOfWeek,
            isActive: true,
        };
        if (zoneId) {
            whereClause.zoneId = zoneId;
        }
        const plannings = await prisma.planning.findMany({
            where: whereClause,
            orderBy: { startTime: 'asc' },
        });
        if (plannings.length === 0) {
            return NextResponse.json({ data: [] });
        }
        const dayStart = new Date(targetDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(targetDate);
        dayEnd.setHours(23, 59, 59, 999);
        const bookedWhere: any = {
            scheduledAt: { gte: dayStart, lte: dayEnd },
            status: { not: 'CANCELLED' },
        };
        if (zoneId) {
            bookedWhere.zoneId = zoneId;
        }
        const bookedInterventions = await prisma.intervention.findMany({
            where: bookedWhere,
            select: { scheduledAt: true, duration: true },
        });
        const slots: { start: string; end: string; available: boolean }[] = [];
        for (const planning of plannings) {
            const [startH, startM] = planning.startTime.split(':').map(Number);
            const [endH, endM] = planning.endTime.split(':').map(Number);
            const planningStartMin = startH * 60 + startM;
            const planningEndMin = endH * 60 + endM;
            for (let slotStart = planningStartMin; slotStart + duration <= planningEndMin; slotStart += duration) {
                const slotStartH = String(Math.floor(slotStart / 60)).padStart(2, '0');
                const slotStartM = String(slotStart % 60).padStart(2, '0');
                const slotEnd = slotStart + duration;
                const slotEndH = String(Math.floor(slotEnd / 60)).padStart(2, '0');
                const slotEndM = String(slotEnd % 60).padStart(2, '0');
                const startStr = `${slotStartH}:${slotStartM}`;
                const endStr = `${slotEndH}:${slotEndM}`;
                const slotDateTime = new Date(targetDate);
                slotDateTime.setHours(Math.floor(slotStart / 60), slotStart % 60, 0, 0);
                const isBooked = bookedInterventions.some((intervention) => {
                    const bookedStart = new Date(intervention.scheduledAt).getTime();
                    const bookedEnd = bookedStart + intervention.duration * 60 * 1000;
                    const slotStartTime = slotDateTime.getTime();
                    const slotEndTime = slotStartTime + duration * 60 * 1000;
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