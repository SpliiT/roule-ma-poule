import webpush from 'web-push';
import { prisma } from '@/lib/prisma';

/**
 * Configuration initiale du protocole Web Push avec les clés VAPID (Voluntary Application Server Identification).
 * Les clés VAPID permettent aux serveurs push des navigateurs (ex: Google FCM) 
 * d'identifier notre serveur (Roule Ma Poule) comme l'expéditeur légitime,
 * garantissant que seul ce serveur peut envoyer des notifications.
 */
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

/**
 * Type décrivant le corps (payload) d'une notification Push envoyée au client.
 */
export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: string;
    data?: any;
}

/**
 * Envoie une notification Web Push à un utilisateur spécifique.
 * 
 * Fonctionnement :
 * 1. Récupère tous les abonnements (appareils) actifs de l'utilisateur en base de données.
 * 2. Diffuse la notification en parallèle via web-push.
 * 3. En cas d'échec de distribution (ex: l'utilisateur a révoqué la permission, erreur 404/410), 
 *    l'abonnement invalide est automatiquement nettoyé (supprimé de la BDD).
 * 
 * @param {string} userId - L'identifiant (ID Prisma) de l'utilisateur cible.
 * @param {PushNotificationPayload} payload - Le contenu visuel de la notification.
 */
export async function sendPushNotification(userId: string, payload: PushNotificationPayload) {
    try {
        console.log(`[Push] Attempting to send notification to user: ${userId}`);
        const subscriptions = await prisma.pushSubscription.findMany({
            where: { userId },
        });

        console.log(`[Push] Found ${subscriptions.length} subscriptions for user: ${userId}`);
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

                console.log(`[Push] Sending to endpoint: ${sub.endpoint.substring(0, 30)}...`);
                return webpush.sendNotification(pushSubscription, JSON.stringify(payload));
            })
        );

        
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            if (result.status === 'fulfilled') {
                console.log(`[Push] Successfully sent to subscription ${subscriptions[i].id}`);
            } else {
                const error = result.reason;
                console.error(`[Push] Failed to send to subscription ${subscriptions[i].id}:`, error.message || error);
                if (error.statusCode === 404 || error.statusCode === 410) {
                    console.log(`[Push] Deleting invalid subscription: ${subscriptions[i].id}`);
                    await prisma.pushSubscription.delete({
                        where: { id: subscriptions[i].id },
                    });
                }
            }
        }
    } catch (error) {
        console.error('[Push] Fatal error in sendPushNotification:', error);
    }
}
