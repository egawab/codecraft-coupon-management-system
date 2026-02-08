import { redis } from '@/lib/redis';

// Redis key patterns for analytics
export const ANALYTICS_KEYS = {
  // Counters (real-time)
  COUPON_VIEWS: (couponId: string) => `analytics:coupon:${couponId}:views`,
  COUPON_COPIES: (couponId: string) => `analytics:coupon:${couponId}:copies`,
  COUPON_CLICKS: (couponId: string) => `analytics:coupon:${couponId}:clicks`,
  COUPON_UNIQUE_VIEWS: (couponId: string) => `analytics:coupon:${couponId}:unique_views`,
  COUPON_UNIQUE_COPIES: (couponId: string) => `analytics:coupon:${couponId}:unique_copies`,
  COUPON_UNIQUE_CLICKS: (couponId: string) => `analytics:coupon:${couponId}:unique_clicks`,
  
  // Store analytics
  STORE_VIEWS: (storeId: string) => `analytics:store:${storeId}:views`,
  STORE_COUPON_VIEWS: (storeId: string) => `analytics:store:${storeId}:coupon_views`,
  STORE_COUPON_COPIES: (storeId: string) => `analytics:store:${storeId}:coupon_copies`,
  STORE_COUPON_CLICKS: (storeId: string) => `analytics:store:${storeId}:coupon_clicks`,
  
  // Session tracking for unique counts
  SESSION_VIEWED_COUPON: (sessionId: string, couponId: string) => 
    `session:${sessionId}:viewed:${couponId}`,
  SESSION_COPIED_COUPON: (sessionId: string, couponId: string) => 
    `session:${sessionId}:copied:${couponId}`,
  SESSION_CLICKED_COUPON: (sessionId: string, couponId: string) => 
    `session:${sessionId}:clicked:${couponId}`,
};

/**
 * Increment a counter in Redis
 */
export async function incrementCounter(key: string): Promise<number> {
  const result = await redis.incr(key);
  // Set expiry to 48 hours if this is a new key
  await redis.expire(key, 172800);
  return typeof result === 'number' ? result : parseInt(String(result));
}

/**
 * Get counter value from Redis
 */
export async function getCounter(key: string): Promise<number> {
  const result = await redis.get(key);
  return result ? parseInt(String(result)) : 0;
}

/**
 * Set a session marker (returns true if new, false if already exists)
 */
export async function setSessionMarker(key: string, ttl: number = 86400): Promise<boolean> {
  const result = await redis.set(key, '1', { ex: ttl, nx: true });
  return result === 'OK';
}

/**
 * Check if session marker exists
 */
export async function hasSessionMarker(key: string): Promise<boolean> {
  const result = await redis.get(key);
  return result !== null;
}
