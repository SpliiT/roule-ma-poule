import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * GET /api/admin/export — Exporte les interventions au format CSV
 * Query params: from, to, status
 */
export async function GET(req: Request) {
    try {
        await requireRole('ADMIN');

        const url = new URL(req.url);
        const from = url.searchParams.get('from');
        const to = url.searchParams.get('to');
        const status = url.searchParams.get('status');

        const where: any = {};
        if (from) where.scheduledAt = { ...where.scheduledAt, gte: new Date(from) };
        if (to) where.scheduledAt = { ...where.scheduledAt, lte: new Date(to) };
        if (status) where.status = status;

        const interventions = await prisma.intervention.findMany({
            where,
            include: {
                client: { select: { name: true, email: true } },
                technician: { select: { name: true } },
                forfait: { select: { name: true } },
                zone: { select: { name: true } },
            },
            orderBy: { scheduledAt: 'desc' },
        });

        // Construire le CSV
        const headers = [
            'ID', 'Date', 'Statut', 'Forfait', 'Client', 'Email Client',
            'Technicien', 'Zone', 'Adresse', 'Ville', 'Code Postal',
            'Durée (min)', 'Prix Total (€)', 'Payé', 'Méthode Paiement',
        ];

        const rows = interventions.map((i: any) => [
            i.id,
            format(new Date(i.scheduledAt), 'dd/MM/yyyy HH:mm', { locale: fr }),
            i.status,
            i.forfait?.name || '',
            i.client?.name || '',
            i.client?.email || '',
            i.technician?.name || '',
            i.zone?.name || '',
            i.address,
            i.city,
            i.postalCode,
            i.duration,
            Number(i.totalPrice).toFixed(2),
            i.isPaid ? 'Oui' : 'Non',
            i.paymentMethod || '',
        ]);

        const csvContent = [
            headers.join(';'),
            ...rows.map((row: any) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
        ].join('\n');

        const BOM = '\uFEFF'; // Pour Excel
        return new Response(BOM + csvContent, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="interventions_${format(new Date(), 'yyyyMMdd')}.csv"`,
            },
        });
    } catch (error) {
        console.error('Export CSV error:', error);
        return NextResponse.json({ error: 'Erreur export' }, { status: 500 });
    }
}
