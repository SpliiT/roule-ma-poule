import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        // En prod, on pourrait vérifier un secret dans le header pour sécuriser le cron
        // const authHeader = req.headers.get('authorization');
        // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        //     return new Response('Unauthorized', { status: 401 });
        // }

        const now = new Date();
        const pendingNotifications = await prisma.scheduledNotification.findMany({
            where: {
                status: 'PENDING',
                scheduledAt: { lte: now }
            }
        });

        console.log(`[Cron Push] Found ${pendingNotifications.length} notifications to send`);

        for (const notification of pendingNotifications) {
            try {
                if (notification.userId) {
                    // Cible unique
                    await sendPushNotification(notification.userId, {
                        title: notification.title,
                        body: notification.body,
                        data: { url: notification.url }
                    });
                } else if (notification.role) {
                    // Par rôle
                    const users = await prisma.user.findMany({
                        where: { role: notification.role, pushSubscriptions: { some: {} } },
                        select: { id: true }
                    });

                    await Promise.all(users.map(u =>
                        sendPushNotification(u.id, {
                            title: notification.title,
                            body: notification.body,
                            data: { url: notification.url }
                        })
                    ));
                } else {
                    // Broadcast total
                    const users = await prisma.user.findMany({
                        where: { pushSubscriptions: { some: {} } },
                        select: { id: true }
                    });

                    await Promise.all(users.map(u =>
                        sendPushNotification(u.id, {
                            title: notification.title,
                            body: notification.body,
                            data: { url: notification.url }
                        })
                    ));
                }

                await prisma.scheduledNotification.update({
                    where: { id: notification.id },
                    data: {
                        status: 'SENT',
                        sentAt: new Date()
                    }
                });

            } catch (error) {
                console.error(`[Cron Push] Failed to send notification ${notification.id}:`, error);
                await prisma.scheduledNotification.update({
                    where: { id: notification.id },
                    data: { status: 'FAILED' }
                });
            }
        }

        return NextResponse.json({
            success: true,
            processed: pendingNotifications.length
        });

    } catch (error: any) {
        console.error('CRON notifications error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
