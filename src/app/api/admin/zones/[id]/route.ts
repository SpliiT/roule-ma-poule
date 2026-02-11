import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * API pour modifier ou supprimer une zone spécifique (Admin uniquement).
 */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole('ADMIN');
        const { id } = await params;
        const body = await req.json();
        const { name, geometry, color, isActive, description, technicianIds } = body;

        // Build update data, filtering undefined values
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (geometry !== undefined) updateData.geometry = geometry;
        if (color !== undefined) updateData.color = color;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (description !== undefined) updateData.description = description;

        // Handle technician assignments
        if (technicianIds !== undefined) {
            // Delete all existing assignments then create new ones
            await prisma.technicianZone.deleteMany({ where: { zoneId: id } });

            if (technicianIds.length > 0) {
                await prisma.technicianZone.createMany({
                    data: technicianIds.map((technicianId: string) => ({
                        technicianId,
                        zoneId: id,
                    })),
                });
            }
        }

        const zone = await prisma.zone.update({
            where: { id },
            data: updateData,
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
        console.error('PATCH zone error:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireRole('ADMIN');
        const { id } = await params;

        // TechnicianZone records will be cascade-deleted
        await prisma.zone.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE zone error:', error);
        return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
}
