import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * API pour permettre au client de suivre son technicien "Uber Eats style".
 */
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const intervention = await prisma.intervention.findUnique({
            where: { id },
            include: {
                technician: {
                    select: {
                        name: true,
                        currentLat: true,
                        currentLng: true,
                        lastLocUpdate: true,
                    },
                },
            },
        });

        if (!intervention) {
            return NextResponse.json({ error: 'Intervention non trouvée' }, { status: 404 });
        }

        // Le tracking n'est disponible que si l'intervention est "CONFIRMED" ou "IN_PROGRESS"
        // et si le technicien a activé le tracking pour cette course.
        if (intervention.status !== 'CONFIRMED' && intervention.status !== 'IN_PROGRESS') {
            return NextResponse.json({
                status: intervention.status,
                trackingActive: false,
                message: "Le technicien n'est pas encore en route."
            });
        }

        if (!intervention.technician) {
            return NextResponse.json({ error: 'Aucun technicien assigné' }, { status: 400 });
        }

        return NextResponse.json({
            status: intervention.status,
            trackingActive: true,
            location: {
                lat: intervention.technician.currentLat,
                lng: intervention.technician.currentLng,
                updatedAt: intervention.technician.lastLocUpdate,
            },
            technicianName: intervention.technician.name,
            targetLocation: {
                address: intervention.address,
                lat: intervention.latitude,
                lng: intervention.longitude,
            }
        });
    } catch (error) {
        console.error('Get tracking error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
