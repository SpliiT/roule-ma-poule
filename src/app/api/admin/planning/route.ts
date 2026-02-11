import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPlanningSchema = z.object({
    zoneId: z.string().min(1, 'Zone requise'),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM attendu'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:MM attendu'),
});

export async function GET() {
    try {
        await requireRole('ADMIN');
        const plannings = await prisma.planning.findMany({
            where: { isActive: true },
            include: { zone: { select: { id: true, name: true, color: true } } },
            orderBy: [{ zoneId: 'asc' }, { dayOfWeek: 'asc' }, { startTime: 'asc' }],
        });
        return NextResponse.json({ data: plannings });
    } catch (error) {
        console.error('GET planning error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}

export async function POST(req: Request) {
    try {
        await requireRole('ADMIN');
        const body = await req.json();
        const data = createPlanningSchema.parse(body);

        // Vérifier que la zone existe
        const zone = await prisma.zone.findUnique({ where: { id: data.zoneId } });
        if (!zone) return NextResponse.json({ error: 'Zone introuvable' }, { status: 404 });

        const planning = await prisma.planning.create({
            data: {
                zoneId: data.zoneId,
                dayOfWeek: data.dayOfWeek,
                startTime: data.startTime,
                endTime: data.endTime,
                isActive: true,
            },
            include: { zone: { select: { id: true, name: true, color: true } } },
        });

        return NextResponse.json({ data: planning }, { status: 201 });
    } catch (error) {
        console.error('POST planning error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides', details: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
