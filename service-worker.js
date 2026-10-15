const CACHE_NAME = 'pdf-toolkit-v1.0.0';
const ASSETS_TO_CACHE = [
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/ui-manager.js',
  './js/engine-manager.js',
  './js/file-manager.js',
  './js/offline-manager.js',
  './js/tools-config.js',
  './engines/pdf-engine.js',
  './engines/image-engine.js',
  './engines/office-engine.js',
  './engines/ocr-engine.js',
  './engines/reader-engine.js',
  './engines/html-pdf-engine.js',
  './offline.html',
  './assets/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./offline.html');
        }
      });
    })
  );
});
