/* Cache only this app's public catalog and static assets, never Firebase traffic. */
const CACHE_NAME = '__CACHE_NAME__';
const PREFIX = 'cinemastream-public-';
self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const response = await fetch('/offline-manifest.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Offline manifest is unavailable');
    const urls = await response.json();
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE_NAME) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(url.pathname + '.html')) || (await cache.match(url.pathname)) || (await cache.match('/index.html'));
    }));
    return;
  }
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/_expo/')) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const hit = await cache.match(event.request);
      if (hit) return hit;
      const response = await fetch(event.request);
      if (response.ok) await cache.put(event.request, response.clone());
      return response;
    })());
  }
});
