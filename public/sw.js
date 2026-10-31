// CoinSave service worker: an offline page for page navigations, and nothing else.
// It never answers /api or /socket.io and caches no data, so balances are always fresh.
const CACHE = 'coinsave-offline-v2';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' }))),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      // No navigation preload: it sends a request for EVERY navigation in scope, and the ones this
      // worker leaves alone (/api/*) then go out a second time. A doubled OAuth callback reuses its
      // one-time code and fails. v1 enabled it, so turn it off explicitly.
      if (self.registration.navigationPreload) await self.registration.navigationPreload.disable();
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode !== 'navigate') return;
  const url = new URL(event.request.url);
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/socket.io/')
  ) {
    return;
  }
  event.respondWith(
    (async () => {
      try {
        return await fetch(event.request);
      } catch {
        return (await caches.match(OFFLINE_URL)) || Response.error();
      }
    })(),
  );
});
