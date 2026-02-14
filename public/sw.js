// Service Worker for CamCut PWA
// Enhanced with offline video support

const CACHE_NAME = 'camcut-v4';
const STATIC_CACHE = 'camcut-static-v4';
const VIDEO_CACHE = 'camcut-videos-v4';
const API_CACHE = 'camcut-api-v4';

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
      ]);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== VIDEO_CACHE && 
              cacheName !== API_CACHE &&
              !cacheName.startsWith('workbox-')) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
 
  // Handle static assets with StaleWhileRevalidate strategy
  if (request.destination === 'script' || 
      request.destination === 'style' ||
      request.destination === 'image' ||
      /\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf|eot)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle HTML pages with NetworkFirst strategy
  if (request.destination === 'document' || 
      url.pathname === '/' || 
      url.pathname.endsWith('.html')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return fetch(request).then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        }).catch(() => {
          return cache.match(request).then((cachedResponse) => {
            return cachedResponse || cache.match('/index.html');
          });
        });
      })
    );
    return;
  }

  // Default: NetworkFirst for everything else
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_VIDEO') {
    const { url, blob } = event.data;
    caches.open(VIDEO_CACHE).then((cache) => {
      cache.put(url, new Response(blob));
    });
  }
});
