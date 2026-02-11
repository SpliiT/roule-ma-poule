import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('CLERK_WEBHOOK_SECRET manquant');
        return NextResponse.json(
            { error: 'Configuration serveur manquante' },
            { status: 500 }
        );
    }

    // Récupérer les headers Svix
    const headerPayload = await headers();
    const svix_id = headerPayload.get('svix-id');
    const svix_timestamp = headerPayload.get('svix-timestamp');
    const svix_signature = headerPayload.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return NextResponse.json(
            { error: 'Headers Svix manquants' },
            { status: 400 }
        );
    }

    // Vérifier la signature
    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Erreur vérification webhook:', err);
        return NextResponse.json(
            { error: 'Signature invalide' },
            { status: 400 }
        );
    }

    // Traiter les événements
    const eventType = evt.type;

    try {
        switch (eventType) {
            case 'user.created': {
                const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
                const email = email_addresses[0]?.email_address;
                const name = [first_name, last_name].filter(Boolean).join(' ') || null;
                const phone = phone_numbers?.[0]?.phone_number || null;

                if (!email) {
                    return NextResponse.json(
                        { error: 'Email manquant' },
                        { status: 400 }
                    );
                }

                await prisma.user.create({
                    data: {
                        clerkId: id,
                        email,
                        name,
                        phone,
                        role: 'CLIENT', // Par défaut, tout nouveau user est CLIENT
                    },
                });

                console.log(`[Clerk Webhook] Utilisateur créé: ${email}`);
                break;
            }

            case 'user.updated': {
                const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
                const email = email_addresses[0]?.email_address;
                const name = [first_name, last_name].filter(Boolean).join(' ') || null;
                const phone = phone_numbers?.[0]?.phone_number || null;

                await prisma.user.update({
                    where: { clerkId: id },
                    data: {
                        email,
                        name,
                        phone,
                    },
                });

                console.log(`[Clerk Webhook] Utilisateur mis à jour: ${email}`);
                break;
            }

            case 'user.deleted': {
                const { id } = evt.data;

                if (id) {
                    await prisma.user.delete({
                        where: { clerkId: id },
                    });

                    console.log(`[Clerk Webhook] Utilisateur supprimé: ${id}`);
                }
                break;
            }

            default:
                console.log(`[Clerk Webhook] Event non traité: ${eventType}`);
        }
    } catch (error) {
        console.error(`[Clerk Webhook] Erreur traitement event ${eventType}:`, error);
        return NextResponse.json(
            { error: 'Erreur interne' },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
