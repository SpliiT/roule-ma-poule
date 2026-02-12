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
            const registration = await navigator.serviceWorker.ready;
            const existingSubscription = await registration.pushManager.getSubscription();

            if (existingSubscription && !forceRequest) {
                setIsSubscribed(true);
                await syncSubscription(existingSubscription);
                return;
            }

            // If we are here and forceRequest is true, it means we want to subscribe
            // The permission must have been granted ALREADY in the UI click handler
            if (forceRequest && Notification.permission === 'granted') {
                const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                if (!publicKey) {
                    console.error('PushManager: Missing VAPID public key');
                    return;
                }

                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                };

                const subscription = await registration.pushManager.subscribe(subscribeOptions);
                await syncSubscription(subscription);
                setIsSubscribed(true);
                setPermissionStatus('granted');
                toast.success('Notifications activées !');
            }
        } catch (err) {
            console.error('PushManager: Failed to subscribe:', err);
            toast.error('Erreur lors de l\'activation des notifications.');
        }
    }, [user, isLoaded]);

    useEffect(() => {
        if (!isLoaded || !user) return;

        // Only check for existing subscription on load, don't ask for permission
        setPermissionStatus(Notification.permission);
        setupPush(false);

        // Listen for internal events to trigger sync
        const handleTrigger = () => setupPush(true);
        window.addEventListener('trigger-push-setup', handleTrigger);
        return () => window.removeEventListener('trigger-push-setup', handleTrigger);
    }, [user, isLoaded, setupPush]);

    async function syncSubscription(subscription: any) {
        try {
            await axios.post('/api/notifications/push/subscribe', subscription.toJSON());
        } catch (err) {
            console.error('PushManager: Failed to sync subscription with server:', err);
        }
    }

    return null;
}

// Custom hook to trigger push setup
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
