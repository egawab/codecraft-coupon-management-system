/**
 * PWA Configuration
 */

export const PWA_CONFIG = {
  name: 'Kobonz',
  shortName: 'Kobonz',
  description: 'Discover and share amazing deals in your local area',
  themeColor: '#0070f3',
  backgroundColor: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  scope: '/',
  startUrl: '/',
  icons: [
    {
      src: '/icons/icon-72x72.png',
      sizes: '72x72',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-128x128.png',
      sizes: '128x128',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-144x144.png',
      sizes: '144x144',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-152x152.png',
      sizes: '152x152',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/icons/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
  screenshots: [
    {
      src: '/screenshots/desktop-1.png',
      sizes: '1280x720',
      type: 'image/png',
      form_factor: 'wide',
    },
    {
      src: '/screenshots/mobile-1.png',
      sizes: '750x1334',
      type: 'image/png',
      form_factor: 'narrow',
    },
  ],
} as const;

/**
 * Cache strategies
 */
export const CACHE_STRATEGIES = {
  // Cache first, then network
  images: {
    strategy: 'CacheFirst',
    cacheName: 'images-cache',
    maxEntries: 100,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
  },
  // Network first, fallback to cache
  api: {
    strategy: 'NetworkFirst',
    cacheName: 'api-cache',
    maxEntries: 50,
    maxAgeSeconds: 5 * 60, // 5 minutes
  },
  // Stale while revalidate
  static: {
    strategy: 'StaleWhileRevalidate',
    cacheName: 'static-cache',
    maxEntries: 200,
    maxAgeSeconds: 24 * 60 * 60, // 1 day
  },
  // Cache only (for offline page)
  offline: {
    strategy: 'CacheOnly',
    cacheName: 'offline-cache',
  },
} as const;

/**
 * Offline fallback pages
 */
export const OFFLINE_FALLBACKS = {
  page: '/offline.html',
  image: '/images/offline-placeholder.png',
} as const;

/**
 * Background sync tags
 */
export const SYNC_TAGS = {
  ANALYTICS: 'analytics-sync',
  FAVORITES: 'favorites-sync',
  USAGE: 'coupon-usage-sync',
} as const;
