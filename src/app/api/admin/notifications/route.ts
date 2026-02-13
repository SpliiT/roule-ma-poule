import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { sendPushNotification } from '@/lib/push';

export async function GET() {
    try {
        await requireRole('ADMIN');

        const notifications = await prisma.scheduledNotification.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({ data: notifications });
    } catch (error: any) {
        console.error('GET admin notifications error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code
        });
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const admin = await requireRole('ADMIN');
        const body = await req.json();
        const { userId, role, title, body: messageBody, url, scheduledAt } = body;

        if (!title || !messageBody) {
            return NextResponse.json({ error: 'Titre et message requis' }, { status: 400 });
        }

        const isScheduled = !!scheduledAt;
        const scheduleDate = isScheduled ? new Date(scheduledAt) : new Date();

        if (isScheduled && scheduleDate <= new Date()) {
            return NextResponse.json({ error: 'La date programmée doit être dans le futur' }, { status: 400 });
        }

        // Si ce n'est pas programmé, on envoie immédiatement
        if (!isScheduled) {
            if (userId) {
                // Envoi à un seul utilisateur
                await sendPushNotification(userId, {
                    title,
                    body: messageBody,
                    data: { url }
                });

                // On enregistre quand même en base pour l'historique
                await prisma.scheduledNotification.create({
                    data: {
                        userId,
                        title,
                        body: messageBody,
                        url,
                        scheduledAt: scheduleDate,
                        sentAt: new Date(),
                        status: 'SENT'
                    }
                });
            } else if (role) {
                // Envoi par rôle
                const users = await prisma.user.findMany({
                    where: { role, pushSubscriptions: { some: {} } },
                    select: { id: true }
                });

                await Promise.all(users.map(u =>
                    sendPushNotification(u.id, {
                        title,
                        body: messageBody,
                        data: { url }
                    })
                ));

                await prisma.scheduledNotification.create({
                    data: {
                        role,
                        title,
                        body: messageBody,
                        url,
                        scheduledAt: scheduleDate,
                        sentAt: new Date(),
                        status: 'SENT'
                    }
                });
            } else {
                // BROADCAST
                const users = await prisma.user.findMany({
                    where: { pushSubscriptions: { some: {} } },
                    select: { id: true }
                });

                await Promise.all(users.map(u =>
                    sendPushNotification(u.id, {
                        title,
                        body: messageBody,
                        data: { url }
                    })
                ));

                await prisma.scheduledNotification.create({
                    data: {
                        title,
                        body: messageBody,
                        url,
                        scheduledAt: scheduleDate,
                        sentAt: new Date(),
                        status: 'SENT'
                    }
                });
            }

            return NextResponse.json({ success: true, message: 'Notification envoyée instantanément' });
        } else {
            // Programmation
            const scheduled = await prisma.scheduledNotification.create({
                data: {
                    userId,
                    role,
                    title,
                    body: messageBody,
                    url,
                    scheduledAt: scheduleDate,
                    status: 'PENDING'
                }
            });

            return NextResponse.json({ success: true, data: scheduled });
        }
    } catch (error: any) {
        console.error('POST admin notifications error details:', {
            message: error.message,
            stack: error.stack,
            code: error.code,
            meta: error.meta
        });
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}
