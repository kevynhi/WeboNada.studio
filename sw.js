const CACHE_NAME = 'webonada-v1';

const PRECACHE = [
  '/offline.html',
  '/css/main.css',
  '/favicon.svg',
];

// Instalar: guardar en caché los archivos esenciales
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// Activar: limpiar cachés viejas de versiones anteriores
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

// Fetch: interceptar navegaciones — si falla la red, mostrar offline.html
self.addEventListener('fetch', e => {
  // Solo interceptar peticiones de navegación (cargar una página)
  if(e.request.mode !== 'navigate') return;

  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match('/offline.html'))
  );
});
