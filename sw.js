const CACHE_NAME = 'webonada-v2';

const PRECACHE = [
  '/',
  '/offline.html',
  '/css/main.css',
  '/js/main.js',
  '/favicon.svg',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.mode !== 'navigate') return;

  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match('/offline.html'))
  );
});
