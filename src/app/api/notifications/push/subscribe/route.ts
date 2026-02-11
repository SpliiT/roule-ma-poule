import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const subscribeSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string(),
        auth: z.string(),
    }),
});

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        const body = await req.json();
        const { endpoint, keys } = subscribeSchema.parse(body);

        // Enregistrer ou mettre à jour la souscription
        await prisma.pushSubscription.upsert({
            where: { endpoint },
            update: {
                userId: user.id,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            create: {
                userId: user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Push subscription error:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
