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
            console.log('PushManager: Starting setup...');
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                console.warn('Push manager: ServiceWorker or PushManager not supported');
                return;
            }

            try {
                const registration = await navigator.serviceWorker.ready;
                console.log('PushManager: ServiceWorker ready', registration);

                const existingSubscription = await registration.pushManager.getSubscription();
                console.log('PushManager: Existing subscription:', existingSubscription);

                if (existingSubscription) {
                    setIsSubscribed(true);
                    console.log('PushManager: Already subscribed, syncing...');
                    await syncSubscription(existingSubscription);
                    return;
                }

                // Request permission
                console.log('PushManager: Requesting permission...');
                const permission = await Notification.requestPermission();
                console.log('PushManager: Permission result:', permission);
                if (permission !== 'granted') {
                    console.warn('PushManager: Permission not granted');
                    return;
                }

                const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
                console.log('PushManager: Using VAPID key:', publicKey);

                if (!publicKey) {
                    console.error('PushManager: Missing VAPID public key');
                    return;
                }

                const subscribeOptions = {
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey),
                };

                console.log('PushManager: Subscribing...');
                const subscription = await registration.pushManager.subscribe(subscribeOptions);
                console.log('PushManager: Subscription successful:', subscription);
                await syncSubscription(subscription);
                setIsSubscribed(true);
            } catch (err) {
                console.error('PushManager: Failed to subscribe:', err);
            }
        }

        setupPush();
    }, [user, isLoaded]);

    async function syncSubscription(subscription: any) {
        try {
            console.log('PushManager: Syncing with server...');
            const response = await axios.post('/api/notifications/push/subscribe', subscription.toJSON());
            console.log('PushManager: Sync complete', response.data);
        } catch (err) {
            console.error('PushManager: Failed to sync subscription with server:', err);
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
