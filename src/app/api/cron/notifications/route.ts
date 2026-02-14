import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushNotification } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        
        
        
        
        

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
                const metadata = (notification.metadata as any) || {};
                const pushPayload = {
                    title: notification.title,
                    body: notification.body,
                    icon: metadata.icon,
                    image: metadata.image,
                    badge: metadata.badge,
                    data: {
                        url: notification.url || (metadata.url)
                    }
                };

                if (notification.userId) {
                    await sendPushNotification(notification.userId, pushPayload);
                } else if (notification.role) {
                    const users = await prisma.user.findMany({
                        where: { role: notification.role as any, pushSubscriptions: { some: {} } },
                        select: { id: true }
                    });

                    await Promise.all(users.map(u => sendPushNotification(u.id, pushPayload)));
                } else {
                    const users = await prisma.user.findMany({
                        where: { pushSubscriptions: { some: {} } },
                        select: { id: true }
                    });

                    await Promise.all(users.map(u => sendPushNotification(u.id, pushPayload)));
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
