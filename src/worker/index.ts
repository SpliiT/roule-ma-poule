/// <reference lib="webworker" />

export default null as any;

self.addEventListener('push', (event: any) => {
    console.log('SW: Push event received', event);
    if (!event.data) {
        console.warn('SW: Push event has no data');
        return;
    }

    try {
        const data = event.data.json();
        console.log('SW: Push data parsed:', data);
        const { title, body, icon, data: customData } = data;

        const options = {
            body: body || 'Nouvelle notification',
            icon: icon || '/images/mascotte.png',
            badge: '/images/favicon.png',
            data: customData,
            vibrate: [100, 50, 100],
        };

        event.waitUntil((self as any).registration.showNotification(title || 'Roule Ma Poule', options));
    } catch (err) {
        console.error('SW: Error handling push event:', err);
    }
});

self.addEventListener('notificationclick', (event: any) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: any) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if ((self as any).clients.openWindow) {
                return (self as any).clients.openWindow(urlToOpen);
            }
        })
    );
});
