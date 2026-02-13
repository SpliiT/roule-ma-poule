'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { toast } from 'sonner';

export function NotificationsManager() {
    const { user, isLoaded } = useUser();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

    const setupPush = useCallback(async (forceRequest = false) => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push manager: ServiceWorker or PushManager not supported');
            return;
        }

        try {
            if (forceRequest) toast.info('Initialisation de la souscription...');
            const registration = await navigator.serviceWorker.ready;

            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription) {
                console.log('SW: Existing subscription found, syncing...');
                setIsSubscribed(true);
                await syncSubscription(existingSubscription);
                if (!forceRequest) return;
            }

            if (forceRequest && Notification.permission === 'granted') {
                const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!publicKey) {
                    toast.error('Clé VAPID manquante côté client.');
                    return;
                }

                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                };

                try {
                    if (forceRequest) toast.info('Génération de la souscription...');
                    const subscription = await registration.pushManager.subscribe(subscribeOptions);
                    if (forceRequest) toast.info('Souscription générée, synchronisation...');
                    await syncSubscription(subscription);
                    setIsSubscribed(true);
                    setPermissionStatus('granted');
                    toast.success('Notifications activées avec succès !');
                } catch (subErr: any) {
                    console.error('PushManager: Subscription error:', subErr);
                    toast.error(`Erreur de souscription: ${subErr.message || 'Inconnue'}`);
                }
            } else if (forceRequest && Notification.permission === 'default') {
                // Request permission if not granted yet
                const permission = await Notification.requestPermission();
                setPermissionStatus(permission);
                if (permission === 'granted') {
                    setupPush(true);
                }
            }
        } catch (err: any) {
            console.error('PushManager: Failed to setup push:', err);
            toast.error(`Erreur setup: ${err.message || 'Inconnue'}`);
        }
    }, []);

    useEffect(() => {
        if (!isLoaded || !user) return;

        setPermissionStatus(Notification.permission);
        setupPush(false);

        const handleTrigger = () => setupPush(true);
        window.addEventListener('trigger-push-setup', handleTrigger);
        return () => window.removeEventListener('trigger-push-setup', handleTrigger);
    }, [user, isLoaded, setupPush]);

    async function syncSubscription(subscription: any) {
        try {
            console.log('PushManager: Syncing subscription...');
            await axios.post('/api/notifications/push/subscribe', subscription.toJSON());
            console.log('PushManager: Sync complete');
        } catch (err: any) {
            console.error('PushManager: Failed to sync subscription with server:', err);
            // Don't show toast for background sync failures to avoid spamming the user
            if (permissionStatus === 'granted') {
                // only toast if user explicitly tried to enable
            }
        }
    }

    return null;
}

export function usePushNotifications() {
    return {
        requestPermission: () => {
            window.dispatchEvent(new CustomEvent('trigger-push-setup'));
        }
    };
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
