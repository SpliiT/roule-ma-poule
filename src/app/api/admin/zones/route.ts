import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function GET() {
    try {
        await requireRole('ADMIN');
        const zones = await prisma.zone.findMany({
            include: {
                technicians: {
                    include: {
                        technician: { select: { id: true, name: true, email: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ data: zones });
    } catch (error) {
        console.error('GET zones error:', error);
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
export async function POST(req: Request) {
    try {
        await requireRole('ADMIN');
        const body = await req.json();
        const { name, geometry, color, description, technicianIds } = body;
        if (!name || !geometry) {
            return NextResponse.json({ error: 'Nom et géométrie requis' }, { status: 400 });
        }
        const zone = await prisma.zone.create({
            data: {
                name,
                geometry,
                color: color || '#3B82F6',
                description: description || null,
                isActive: true,
                ...(technicianIds?.length > 0 && {
                    technicians: {
                        create: technicianIds.map((technicianId: string) => ({
                            technicianId,
                        })),
                    },
                }),
            },
            include: {
                technicians: {
                    include: {
                        technician: { select: { id: true, name: true, email: true } },
                    },
                },
            },
        });
        return NextResponse.json({ data: zone });
    } catch (error) {
        console.error('POST zone error:', error);
        return NextResponse.json({ error: 'Erreur lors de la création de la zone' }, { status: 500 });
    }
}