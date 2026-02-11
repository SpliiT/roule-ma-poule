import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
const locationSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
});
export async function POST(req: Request) {
    try {
        const user = await requireRole('TECHNICIEN');
        const body = await req.json();
        const { latitude, longitude } = locationSchema.parse(body);
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                currentLat: latitude,
                currentLng: longitude,
                lastLocUpdate: new Date(),
            },
        });
        return NextResponse.json({ success: true, data: { lat: latitude, lng: longitude } });
    } catch (error) {
        console.error('Update location error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Non autorisé ou erreur serveur' }, { status: 401 });
    }
}