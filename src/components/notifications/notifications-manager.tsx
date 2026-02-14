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
        console.log('PushManager: Checking service worker and push support');
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push manager: ServiceWorker or PushManager not supported');
            return;
        }

        try {
            console.log('PushManager: Service worker and PushManager supported');
            if (forceRequest) toast.info('Initialisation de la souscription...');
            const registration = await navigator.serviceWorker.ready;
            console.log('PushManager: Service worker ready', registration);

            const existingSubscription = await registration.pushManager.getSubscription();
            console.log('PushManager: Existing subscription check complete, found:', existingSubscription);

            if (existingSubscription) {
                console.log('SW: Existing subscription found, syncing...');
                setIsSubscribed(true);
                await syncSubscription(existingSubscription);
                if (!forceRequest) return;
            } else if (!forceRequest && Notification.permission === 'granted') {
                console.log('PushManager: Permission already granted but NO subscription found, triggering auto-sync...');
                // Trigger subscription automatically if permission is granted but we don't have a sub in this browser
                setupPush(true);
                return;
            }

            console.log('PushManager: No existing subscription or forceRequest is true');
            if (forceRequest && Notification.permission === 'granted') {
                console.log('PushManager: Notification permission granted, attempting to subscribe');
                const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!publicKey) {
                    toast.error('Clé VAPID manquante côté client.');
                    console.error('PushManager: VAPID public key missing');
                    return;
                }
                console.log('PushManager: VAPID public key found');

                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                };

                try {
                    if (forceRequest) toast.info('Génération de la souscription...');
                    console.log('PushManager: Attempting to subscribe with options:', subscribeOptions);
                    const subscription = await registration.pushManager.subscribe(subscribeOptions);
                    console.log('PushManager: Subscription generated:', subscription);
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
                console.log('PushManager: Notification permission is default, requesting permission');
                // Request permission if not granted yet
                const permission = await Notification.requestPermission();
                setPermissionStatus(permission);
                console.log('PushManager: Notification permission result:', permission);
                if (permission === 'granted') {
                    setupPush(true);
                }
            } else {
                console.log('PushManager: Not forceRequest or permission not granted, skipping subscription attempt');
            }
        } catch (err: any) {
            console.error('PushManager: Failed to setup push:', err);
            toast.error(`Erreur setup: ${err.message || 'Inconnue'}`);
        }
    }, []);

    useEffect(() => {
        console.log('PushManager: useEffect triggered');
        if (!isLoaded || !user) {
            console.log('PushManager: Clerk user not loaded or not available, skipping setupPush');
            return;
        }
        console.log('PushManager: Clerk user loaded:', user);

        if (typeof Notification !== 'undefined') {
            setPermissionStatus(Notification.permission);
            console.log('PushManager: Initial permission status:', Notification.permission);
        } else {
            console.warn('PushManager: Notification API not supported in this browser');
        }
        setupPush(false);

        const handleTrigger = () => {
            console.log('PushManager: trigger-push-setup event received');
            setupPush(true);
        };
        window.addEventListener('trigger-push-setup', handleTrigger);
        return () => {
            console.log('PushManager: Cleaning up trigger-push-setup event listener');
            window.removeEventListener('trigger-push-setup', handleTrigger);
        };
    }, [user, isLoaded, setupPush]);

    async function syncSubscription(subscription: any) {
        console.log('PushManager: Starting syncSubscription');
        try {
            console.log('PushManager: Syncing subscription to server with data:', subscription.toJSON());
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
