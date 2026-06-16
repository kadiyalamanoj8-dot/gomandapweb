// Service Worker for Gomandap PWA
const CACHE_VERSION = 'gomandap-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/favicon.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('Some static assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && !cacheName.startsWith(CACHE_VERSION)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - Network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Network first strategy for API calls
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache first strategy for images and fonts
  if (/\.(png|jpg|jpeg|gif|webp|svg|woff|woff2|ttf|eot)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          const clonedResponse = fetchResponse.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return fetchResponse;
        });
      }).catch(() => {
        if (/image/.test(request.headers.get('accept'))) {
          return caches.match('/og-image.png');
        }
        return new Response('Offline - resource not available', { status: 503 });
      })
    );
    return;
  }

  // Stale while revalidate for HTML and CSS/JS
  event.respondWith(
    caches.match(request).then((response) => {
      const fetchPromise = fetch(request).then((fetchResponse) => {
        const clonedResponse = fetchResponse.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, clonedResponse);
        });
        return fetchResponse;
      });
      return response || fetchPromise;
    }).catch(() => {
      if (request.destination === 'document') {
        return caches.match('/index.html');
      }
      return new Response('Offline - resource not available', { status: 503 });
    })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(
      // Sync cart data when back online
      Promise.resolve()
    );
  }
});

