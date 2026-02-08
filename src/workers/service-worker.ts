/**
 * Service Worker for PWA functionality
 * This file will be compiled and placed in public/sw.js
 */

/// <reference lib="webworker" />

import { CACHE_STRATEGIES, OFFLINE_FALLBACKS, SYNC_TAGS } from '../config/pwa.config';

declare const self: ServiceWorkerGlobalScope;

const CACHE_VERSION = 'v1';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/images/offline-placeholder.png',
];

/**
 * Install event - precache assets
 */
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(`${CACHE_STRATEGIES.offline.cacheName}-${CACHE_VERSION}`)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => !name.endsWith(CACHE_VERSION))
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event - handle requests with caching strategies
 */
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, CACHE_STRATEGIES.api.cacheName));
    return;
  }

  // Images - Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, CACHE_STRATEGIES.images.cacheName));
    return;
  }

  // Static assets - Stale While Revalidate
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      staleWhileRevalidate(request, CACHE_STRATEGIES.static.cacheName)
    );
    return;
  }

  // Pages - Network First with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirst(request, CACHE_STRATEGIES.api.cacheName)
        .catch(() => caches.match(OFFLINE_FALLBACKS.page) as Promise<Response>)
    );
    return;
  }
});

/**
 * Push notification event
 */
self.addEventListener('push', (event: PushEvent) => {
  console.log('[SW] Push notification received');
  
  const data = event.data?.json() ?? {};
  const title = data.title || 'Kobonz';
  const options: NotificationOptions = {
    body: data.body || 'New notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-72x72.png',
    image: data.image,
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' }
    ],
    tag: data.tag || 'default',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    vibrate: data.vibrate !== false ? [200, 100, 200] : undefined,
    silent: data.silent || false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification click event
 */
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  // Handle different actions
  if (event.action === 'close') {
    // Just close the notification
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';
  const notificationId = event.notification.data?.notificationId;

  event.waitUntil(
    Promise.all([
      // Track notification click
      notificationId ? fetch('/api/notifications/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notificationId,
          action: event.action || 'click',
        }),
      }).catch(err => console.error('Track click error:', err)) : Promise.resolve(),
      
      // Open URL
      self.clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then((clientList) => {
          // Check if there's already a window open with this URL
          for (const client of clientList) {
            if (client.url === urlToOpen && 'focus' in client) {
              return client.focus();
            }
          }
          // Check if there's any window we can navigate
          if (clientList.length > 0) {
            const client = clientList[0];
            if ('navigate' in client) {
              client.navigate(urlToOpen);
              return client.focus();
            }
          }
          // Open new window
          if (self.clients.openWindow) {
            return self.clients.openWindow(urlToOpen);
          }
        })
    ])
  );
});

/**
 * Background sync event
 */
self.addEventListener('sync', (event: SyncEvent) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === SYNC_TAGS.ANALYTICS) {
    event.waitUntil(syncAnalytics());
  } else if (event.tag === SYNC_TAGS.FAVORITES) {
    event.waitUntil(syncFavorites());
  } else if (event.tag === SYNC_TAGS.USAGE) {
    event.waitUntil(syncCouponUsage());
  }
});

/**
 * Message event - handle commands from clients
 */
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[SW] Message received:', event.data);

  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((name) => caches.delete(name))))
    );
  }
});

// ============================================
// Cache Strategies
// ============================================

/**
 * Cache First strategy
 */
async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline placeholder for images
    if (request.destination === 'image') {
      const offlineResponse = await caches.match(OFFLINE_FALLBACKS.image);
      if (offlineResponse) return offlineResponse;
    }
    throw error;
  }
}

/**
 * Network First strategy
 */
async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

/**
 * Stale While Revalidate strategy
 */
async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  return cached || fetchPromise;
}

// ============================================
// Background Sync Functions
// ============================================

async function syncAnalytics(): Promise<void> {
  // TODO: Implement analytics sync
  console.log('[SW] Syncing analytics data...');
}

async function syncFavorites(): Promise<void> {
  // TODO: Implement favorites sync
  console.log('[SW] Syncing favorites...');
}

async function syncCouponUsage(): Promise<void> {
  // TODO: Implement coupon usage sync
  console.log('[SW] Syncing coupon usage...');
}

// Export empty object for TypeScript
export {};
