import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

const vapidKeys = {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
};

if (vapidKeys.publicKey && vapidKeys.privateKey) {
    webpush.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL || 'contact@lecyclelyonnais.fr'}`,
        vapidKeys.publicKey,
        vapidKeys.privateKey
    );
}

export async function sendPushNotification(userId: string, payload: { title: string; body: string; data?: any }) {
    try {
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        if (subscriptions.length === 0) return;

        const results = await Promise.allSettled(
            subscriptions.map(async (sub) => {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                };

                return webpush.sendNotification(pushSubscription, JSON.stringify(payload));
            })
        );

        // Nettoyer les souscriptions expirées ou invalides
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === 'rejected') {
                const error = result.reason;
                if (error.statusCode === 404 || error.statusCode === 410) {
                    await prisma.pushSubscription.delete({
                        where: { id: subscriptions[i].id },
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}
