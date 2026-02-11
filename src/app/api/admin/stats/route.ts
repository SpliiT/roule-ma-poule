import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET(req: Request) {
    try {
        await requireRole('ADMIN');
        const url = new URL(req.url);
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        const dateFilter: any = {};
        if (from) dateFilter.gte = new Date(from);
        if (to) dateFilter.lte = new Date(to);
        const interventionWhere = Object.keys(dateFilter).length > 0
            ? { scheduledAt: dateFilter }
            : {};
        const byStatus = await prisma.intervention.groupBy({
            by: ['status'],
            where: interventionWhere,
            _count: true,
        });
        const totalInterventions = await prisma.intervention.count({ where: interventionWhere });
        const revenue = await prisma.intervention.aggregate({
            where: { ...interventionWhere, isPaid: true },
            _sum: { totalPrice: true },
        });
        const totalClients = await prisma.user.count({ where: { role: 'CLIENT' } });
        const totalTechnicians = await prisma.user.count({ where: { role: 'TECHNICIEN' } });
        const totalProducts = await prisma.product.count({ where: { isActive: true } });
        const totalForfaits = await prisma.forfait.count({ where: { isActive: true } });
        const totalZones = await prisma.zone.count({ where: { isActive: true } });
        const recentInterventions = await prisma.intervention.findMany({
            where: interventionWhere,
            include: {
                client: { select: { name: true } },
                technician: { select: { name: true } },
                forfait: { select: { name: true } },
            },
            orderBy: { scheduledAt: 'desc' },
            take: 10,
        });
        const byZone = await prisma.intervention.groupBy({
            by: ['zoneId'],
            where: { ...interventionWhere, zoneId: { not: null } },
            _count: true,
        });
        const zoneIds = byZone.map((z: any) => z.zoneId).filter(Boolean);
        const zones = zoneIds.length > 0
            ? await prisma.zone.findMany({ where: { id: { in: zoneIds as string[] } }, select: { id: true, name: true } })
            : [];
        const byZoneWithNames = byZone.map((z: any) => ({
            zoneId: z.zoneId,
            zoneName: zones.find((zone: any) => zone.id === z.zoneId)?.name || 'Inconnue',
            count: z._count,
        }));
        return NextResponse.json({
            data: {
                totalInterventions,
                totalClients,
                totalTechnicians,
                totalProducts,
                totalForfaits,
                totalZones,
                revenue: Number(revenue._sum.totalPrice || 0),
                byStatus: byStatus.map((s: any) => ({ status: s.status, count: s._count })),
                byZone: byZoneWithNames,
                recentInterventions,
            },
        });
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}