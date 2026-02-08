import { redis } from './redis';

/**
 * Cache utilities for API responses and data
 */

export interface CacheOptions {
  /**
   * Time to live in seconds
   */
  ttl?: number;
  
  /**
   * Namespace prefix for the cache key
   */
  namespace?: string;
  
  /**
   * Tags for cache invalidation
   */
  tags?: string[];
}

const DEFAULT_TTL = 3600; // 1 hour

/**
 * Generate cache key with namespace
 */
function getCacheKey(key: string, namespace?: string): string {
  return namespace ? `cache:${namespace}:${key}` : `cache:${key}`;
}

/**
 * Get data from cache
 */
export async function getCache<T>(
  key: string,
  options: CacheOptions = {}
): Promise<T | null> {
  const { namespace } = options;
  const cacheKey = getCacheKey(key, namespace);
  
  try {
    const data = await redis.get(cacheKey);
    
    if (!data) return null;
    
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set data in cache
 */
export async function setCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = DEFAULT_TTL, namespace, tags } = options;
  const cacheKey = getCacheKey(key, namespace);
  
  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(data));
    
    // Store tags for invalidation
    if (tags && tags.length > 0) {
      const tagKey = getCacheKey(`tags:${key}`, namespace);
      await redis.sadd(tagKey, ...tags);
      await redis.expire(tagKey, ttl);
      
      // Also add key to each tag set for reverse lookup
      for (const tag of tags) {
        const tagKeysKey = getCacheKey(`tag:${tag}:keys`, namespace);
        await redis.sadd(tagKeysKey, cacheKey);
        await redis.expire(tagKeysKey, ttl);
      }
    }
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

/**
 * Delete data from cache
 */
export async function deleteCache(
  key: string,
  options: CacheOptions = {}
): Promise<void> {
  const { namespace } = options;
  const cacheKey = getCacheKey(key, namespace);
  
  try {
    await redis.del(cacheKey);
    
    // Also delete tag metadata
    const tagKey = getCacheKey(`tags:${key}`, namespace);
    await redis.del(tagKey);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

/**
 * Invalidate cache by tag
 */
export async function invalidateCacheByTag(
  tag: string,
  namespace?: string
): Promise<void> {
  const tagKeysKey = getCacheKey(`tag:${tag}:keys`, namespace);
  
  try {
    const keys = await redis.smembers(tagKeysKey);
    
    if (keys && keys.length > 0) {
      await redis.del(...keys, tagKeysKey);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

/**
 * Get or set cache (cache-aside pattern)
 */
export async function getCacheOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key, options);
  
  if (cached !== null) {
    return cached;
  }
  
  // Fetch data
  const data = await fetcher();
  
  // Store in cache
  await setCache(key, data, options);
  
  return data;
}

/**
 * Cache API response wrapper
 */
export function withCache<T>(
  keyGenerator: (...args: any[]) => string,
  options: CacheOptions = {}
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const key = keyGenerator(...args);
      
      return getCacheOrSet<T>(
        key,
        () => originalMethod.apply(this, args),
        options
      );
    };
    
    return descriptor;
  };
}

/**
 * Cached counters (for analytics, views, etc.)
 */
export async function incrementCounter(
  key: string,
  increment: number = 1,
  namespace: string = 'counter'
): Promise<number> {
  const cacheKey = getCacheKey(key, namespace);
  
  try {
    return await redis.incrby(cacheKey, increment);
  } catch (error) {
    console.error('Counter increment error:', error);
    return 0;
  }
}

/**
 * Get counter value
 */
export async function getCounter(
  key: string,
  namespace: string = 'counter'
): Promise<number> {
  const cacheKey = getCacheKey(key, namespace);
  
  try {
    const value = await redis.get(cacheKey);
    return value ? parseInt(value as string, 10) : 0;
  } catch (error) {
    console.error('Counter get error:', error);
    return 0;
  }
}

/**
 * Cache warming - preload frequently accessed data
 */
export async function warmCache<T>(
  items: { key: string; data: T; options?: CacheOptions }[]
): Promise<void> {
  try {
    await Promise.all(
      items.map(({ key, data, options }) => setCache(key, data, options))
    );
  } catch (error) {
    console.error('Cache warming error:', error);
  }
}
