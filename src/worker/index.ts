/// <reference lib="webworker" />

export default null as any;

const CACHE_NAME = 'roule-ma-poule-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css', // Assurez-vous que ce fichier existe ou ajustez le chemin
    '/script.js', // Assurez-vous que ce fichier existe ou ajustez le chemin
    '/images/favicon.png',
    '/images/logo.png',
    '/images/mascotte.png',
    '/offline',
];

self.addEventListener('install', (event: any) => {
    console.log('SW: Install event received');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cache opened, adding URLs');
                return cache.addAll(urlsToCache);
            })
            .then(() => (self as any).skipWaiting()) // Force l'activation du nouveau SW immédiatement
            .catch(error => {
                console.error('SW: Failed to cache during install:', error);
            })
    );
});

self.addEventListener('activate', (event: any) => {
    console.log('SW: Activate event received');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => (self as any).clients.claim()) // Prend le contrôle des clients immédiatement
    );
});

self.addEventListener('fetch', (event: any) => {
    // Ne pas intercepter les requêtes non-GET ou les requêtes vers des origines différentes
    if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache-first: Si la ressource est dans le cache, la servir
                if (response) {
                    return response;
                }
                // Sinon, aller sur le réseau
                return fetch(event.request)
                    .then(networkResponse => {
                        // Si la requête réseau est réussie, mettre en cache la réponse et la retourner
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // Si le réseau échoue, servir la page hors ligne pour les requêtes de navigation
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline');
                        }
                        // Pour les autres types de requêtes (images, scripts, etc.), on peut retourner un fallback ou une erreur
                        // Pour l'instant, on laisse le navigateur gérer l'erreur si ce n'est pas une navigation
                        throw new Error('Network request failed and no cache match.');
                    });
            })
    );
});

self.addEventListener('push', async (event: any) => {
    console.log('SW: Push event received', event);
    if (!event.data) {
        console.warn('SW: Push event has no data');
        return;
    }

    try {
        const data = await event.data.json();
        console.log('SW: Push data parsed:', data);
        const { title, body, icon, data: customData } = data;

        const options = {
            body: body || 'Nouvelle notification',
            icon: '/images/mascotte.png',
            badge: '/images/favicon.png',
            data: {
                ...customData,
                url: customData?.url || '/'
            },
            tag: 'roule-ma-poule-notif',
            renotify: true,
            vibrate: [100, 50, 100],
            requireInteraction: false
        } as any;

        event.waitUntil(
            (self as any).registration.showNotification(title || 'Roule Ma Poule', options)
        );
    } catch (err) {
        console.error('SW: Error handling push event:', err);
    }
});

self.addEventListener('notificationclick', (event: any) => {
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: any) => {
            // Check if there is already a window/tab open with the same URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new one
            if ((self as any).clients.openWindow) {
                return (self as any).clients.openWindow(urlToOpen);
            }
        })
    );
});
