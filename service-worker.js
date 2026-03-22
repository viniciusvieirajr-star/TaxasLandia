const CACHE_NAME = 'jobflex-v1';

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/')) {
        event.respondWith(fetch(event.request).catch(() => {
            return new Response(JSON.stringify({ offline: true }), {
                headers: { 'Content-Type': 'application/json' }
            });
        }));
        return;
    }
    
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).then(res => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                return res;
            });
        })
    );
});