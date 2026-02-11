'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

export function NotificationsManager() {
    const { user, isLoaded } = useUser();
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if (!isLoaded || !user) return;

        async function setupPush() {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('Push notifications not supported');
                return;
            }

            try {
                const registration = await navigator.serviceWorker.ready;
                const existingSubscription = await registration.pushManager.getSubscription();

                if (existingSubscription) {
                    setIsSubscribed(true);
                    // Sync subscription with server just in case
                    await syncSubscription(existingSubscription);
                    return;
                }

                // Request permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
                };

                const subscription = await registration.pushManager.subscribe(subscribeOptions);
                await syncSubscription(subscription);
                setIsSubscribed(true);
            } catch (err) {
                console.error('Failed to subscribe to push:', err);
            }
        }

        setupPush();
    }, [user, isLoaded]);

    async function syncSubscription(subscription: PushSubscription) {
        try {
            await axios.post('/api/notifications/push/subscribe', subscription.toJSON());
        } catch (err) {
            console.error('Failed to sync push subscription:', err);
        }
    }

    return null; // Component works in background
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
