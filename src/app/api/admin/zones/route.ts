import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getDistanceFromLatLonInKm } from '@/lib/utils';
/**
 * Route API (GET) sécurisée - Espace Administrateur.
 * Récupère la liste complète des zones géographiques d'intervention (GeoJSON).
 * Inclut de manière optimisée (via `_count`) le nombre d'interventions en cours 
 * pour chaque zone, facilitant la supervision globale.
 * 
 * @returns {Promise<NextResponse>} Réponse JSON avec la liste des zones.
 */
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
                _count: {
                    select: {
                        interventions: {
                            where: {
                                status: { in: ['PENDING', 'CONFIRMED'] },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ data: zones });
    } catch (error) {
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}
/**
 * Route API (POST) sécurisée - Espace Administrateur.
 * Crée une nouvelle zone d'intervention géographique.
 * 
 * Logique Métier Avancée :
 * Si l'administrateur n'assigne aucun technicien explicitement à la nouvelle zone,
 * le système calcule mathématiquement le point central (barycentre) du polygone GeoJSON.
 * Il boucle ensuite sur les techniciens actifs pour trouver le plus proche (via la formule 
 * de Haversine) et lui assigne automatiquement la zone avec une priorité par défaut.
 * 
 * @param {Request} req - Requête contenant le nom, la géométrie (string JSON), et optionnellement les techniciens.
 * @returns {Promise<NextResponse>} Réponse JSON de la zone créée avec ses relations.
 */
export async function POST(req: Request) {
    try {
        await requireRole('ADMIN');
        const payload = await req.json();
        const { name, geometry, color, description, technicianIds } = payload;
        
        if (!name || !geometry) {
            return NextResponse.json({ error: 'Nom et géométrie requis' }, { status: 400 });
        }
        
        let assignedTechnicianIds = technicianIds || [];

        if (assignedTechnicianIds.length === 0) {
            let centerLat = 0;
            let centerLng = 0;
            let parsedGeometry;
            
            try {
                parsedGeometry = typeof geometry === 'string' ? JSON.parse(geometry) : geometry;
                if (parsedGeometry?.coordinates?.[0]) {
                    const coords = parsedGeometry.coordinates[0];
                    let sumLat = 0, sumLng = 0;
                    coords.forEach((c: number[]) => { sumLng += c[0]; sumLat += c[1]; });
                    centerLat = sumLat / coords.length;
                    centerLng = sumLng / coords.length;
                }
            } catch (e) {
                // Ignore parse errors, fallback will catch it
            }

            if (centerLat !== 0 && centerLng !== 0) {
                const availableTechnicians = await prisma.user.findMany({
                    where: { role: 'TECHNICIEN', isActive: true },
                    include: { addresses: { where: { isDefault: true } } }
                });

                let minDistance = Infinity;
                let closestTechId: string | null = null;

                for (const tech of availableTechnicians) {
                    let techLat = tech.currentLat;
                    let techLng = tech.currentLng;
                    
                    if (techLat === null || techLng === null) {
                        if (tech.addresses && tech.addresses.length > 0) {
                            techLat = tech.addresses[0].latitude;
                            techLng = tech.addresses[0].longitude;
                        }
                    }
                    
                    if (techLat !== null && techLng !== null) {
                        const distance = getDistanceFromLatLonInKm(centerLat, centerLng, techLat, techLng);
                        
                        if (distance < minDistance) {
                            minDistance = distance;
                            closestTechId = tech.id;
                        }
                    }
                }

                if (closestTechId) {
                    assignedTechnicianIds = [closestTechId];
                }
            }
        }

        const newZone = await prisma.zone.create({
            data: {
                name,
                geometry,
                color: color || '#3B82F6',
                description: description || null,
                isActive: true,
                ...(assignedTechnicianIds.length > 0 && {
                    technicians: {
                        create: assignedTechnicianIds.map((techId: string) => ({
                            technicianId: techId,
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
        return NextResponse.json({ data: newZone });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la création de la zone' }, { status: 500 });
    }
}