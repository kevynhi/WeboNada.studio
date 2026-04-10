const CACHE_NAME = 'webonada-v3';

const PRECACHE = [
  '/',
  '/offline.html',
  '/css/main.css',
  '/js/main.js',
  '/favicon.svg',
];

// ── INSTALL: precachea recursos esenciales uno a uno (si uno falla, no bloquea) ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        PRECACHE.map(url =>
          cache.add(url).catch(err => console.warn('[SW] No se cacheó:', url, err))
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: elimina cachés de versiones anteriores ────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── FETCH: Network-first → Caché → offline.html ─────────────────────────────────
self.addEventListener('fetch', e => {
  // Solo GET y solo HTTP/HTTPS
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;

  e.respondWith(
    fetch(e.request)
      .then(networkResponse => {
        // Actualiza la caché con la respuesta fresca
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return networkResponse;
      })
      .catch(() =>
        // Sin red → busca en caché
        caches.match(e.request).then(cached => {
          if (cached) return cached;
          // Navegación sin caché → offline.html
          if (e.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('', { status: 408, statusText: 'Sin conexión' });
        })
      )
  );
});
