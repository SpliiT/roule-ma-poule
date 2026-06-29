import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDistanceFromLatLonInKm } from '@/lib/utils';
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
        let finalTechnicianIds = technicianIds || [];

        if (finalTechnicianIds.length === 0) {
            // Calculer le centre de la zone (très basique : moyenne des points du premier polygone)
            let centerLat = 0;
            let centerLng = 0;
            let parsedGeometry;
            
            try {
                parsedGeometry = typeof geometry === 'string' ? JSON.parse(geometry) : geometry;
                if (parsedGeometry && parsedGeometry.coordinates && parsedGeometry.coordinates[0]) {
                    const coords = parsedGeometry.coordinates[0];
                    let sumLat = 0, sumLng = 0;
                    coords.forEach((c: number[]) => { sumLng += c[0]; sumLat += c[1]; });
                    centerLat = sumLat / coords.length;
                    centerLng = sumLng / coords.length;
                }
            } catch (e) {
                console.error("Erreur parsing geometry", e);
            }

            if (centerLat !== 0 && centerLng !== 0) {
                const allTechnicians = await prisma.user.findMany({
                    where: { role: 'TECHNICIEN', isActive: true },
                    include: { addresses: { where: { isDefault: true } } }
                });

                let minDistance = Infinity;
                let closestTechId: string | null = null;

                for (const tech of allTechnicians) {
                    let techLat = tech.currentLat;
                    let techLng = tech.currentLng;
                    if (techLat === null || techLng === null) {
                        if (tech.addresses && tech.addresses.length > 0) {
                            techLat = tech.addresses[0].latitude;
                            techLng = tech.addresses[0].longitude;
                        }
                    }
                    if (techLat !== null && techLng !== null) {
                        const d = getDistanceFromLatLonInKm(centerLat, centerLng, techLat, techLng);
                        
                        if (d < minDistance) {
                            minDistance = d;
                            closestTechId = tech.id;
                        }
                    }
                }

                if (closestTechId) {
                    finalTechnicianIds = [closestTechId];
                }
            }
        }

        const zone = await prisma.zone.create({
            data: {
                name,
                geometry,
                color: color || '#3B82F6',
                description: description || null,
                isActive: true,
                ...(finalTechnicianIds.length > 0 && {
                    technicians: {
                        create: finalTechnicianIds.map((technicianId: string) => ({
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