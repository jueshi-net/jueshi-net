const CACHE_NAME = 'xixiong-v1.32.21';
const STATIC_CACHE = 'xixiong-static-v1.32.21';
const DYNAMIC_CACHE = 'xixiong-dynamic-v1.32.21';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/tools',
  '/my-links',
  '/analytics',
  '/blog',
  '/favorites'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests - always go to network
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response to cache it
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network fails
        return caches.match(event.request).then((cachedResponse) => {
          return cachedResponse || caches.match('/');
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-links') {
    event.waitUntil(syncLinks());
  }
});

async function syncLinks() {
  // Sync offline saved links when back online
  console.log('Syncing offline data...');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body || '新消息',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: data.url || '/',
      actions: [
        { action: 'view', title: '查看' },
        { action: 'dismiss', title: '关闭' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '喜熊通知', options)
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});
