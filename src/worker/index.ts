

export default null as any;

const CACHE_NAME = 'roule-ma-poule-cache-v1';
const urlsToCache = [
    '/',
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
            .then(() => (self as any).skipWaiting()) 
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
        }).then(() => (self as any).clients.claim()) 
    );
});

self.addEventListener('fetch', (event: any) => {
    const url = new URL(event.request.url);

    
    
    
    
    
    
    if (
        event.request.method !== 'GET' ||
        !event.request.url.startsWith(self.location.origin) ||
        url.pathname.startsWith('/_next/') ||
        url.pathname.startsWith('/api/') ||
        url.pathname.startsWith('/clerk/') ||
        url.search.includes('_rsc') 
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                
                if (response) {
                    return response;
                }
                
                return fetch(event.request)
                    .then(networkResponse => {
                        
                        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        
                        if (event.request.mode === 'navigate') {
                            return caches.match('/offline');
                        }
                        
                        
                        throw new Error('Network request failed and no cache match.');
                    });
            })
    );
});

const getAbsoluteUrl = (path: string) => {
    if (!path) return undefined;
    let url = path;
    if (!path.startsWith('http')) {
        const origin = self.location.origin;
        url = `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
    }

    
    if (url.includes('res.cloudinary.com')) {
        
        if (!url.includes('/f_jpg')) {
            url = url.replace('/upload/', '/upload/f_jpg/');
        }
    }
    return url;
};

self.addEventListener('push', (event: any) => {
    console.log('SW: Push event received', event);

    event.waitUntil(
        (async () => {
            try {
                let payload: any = {};
                if (event.data) {
                    try {
                        payload = event.data.json();
                        console.log('SW: Push data parsed as JSON:', payload);
                    } catch (jsonErr) {
                        const text = event.data.text();
                        console.log('SW: Push data parsed as text (fallback):', text);
                        payload = { title: 'Roule Ma Poule', body: text };
                    }
                }

                const {
                    title: payloadTitle,
                    body: payloadBody,
                    icon: payloadIcon,
                    image: payloadImage,
                    badge: payloadBadge,
                    data: customData
                } = payload;

                const finalTitle = (payloadTitle || 'Roule Ma Poule') + ' (V11)';

                const options = {
                    body: payloadBody || 'Nouvelle notification',
                    icon: getAbsoluteUrl(payloadIcon || '/images/logo.png'),
                    image: getAbsoluteUrl(payloadImage),
                    badge: getAbsoluteUrl(payloadBadge || '/images/favicon.png'),
                    data: {
                        ...customData,
                        url: getAbsoluteUrl(customData?.url || '/')
                    },
                    tag: 'roule-ma-poule-notif',
                    renotify: true,
                    vibrate: [100, 50, 100],
                    requireInteraction: true
                };

                return (self as any).registration.showNotification(finalTitle, options);
            } catch (err) {
                console.error('SW: Error handling push event:', err);
                return (self as any).registration.showNotification('Roule Ma Poule (Err V11)', {
                    body: 'Nouvelle notification',
                    icon: getAbsoluteUrl('/images/logo.png')
                });
            }
        })()
    );
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
