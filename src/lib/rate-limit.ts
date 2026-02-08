import { redis } from './redis';

/**
 * Rate limiting using Redis with sliding window algorithm
 */
export interface RateLimitConfig {
  /**
   * Unique identifier for the rate limit (e.g., IP address, user ID)
   */
  identifier: string;
  
  /**
   * Maximum number of requests allowed
   */
  limit: number;
  
  /**
   * Time window in seconds
   */
  window: number;
  
  /**
   * Optional: Namespace for the rate limit key
   */
  namespace?: string;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean;
  
  /**
   * Number of requests remaining in the current window
   */
  remaining: number;
  
  /**
   * Total limit
   */
  limit: number;
  
  /**
   * Time when the rate limit resets (Unix timestamp)
   */
  reset: number;
  
  /**
   * Retry after (in seconds) if rate limited
   */
  retryAfter?: number;
}

/**
 * Check and enforce rate limit using Redis
 */
export async function rateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { identifier, limit, window, namespace = 'ratelimit' } = config;
  
  const key = `${namespace}:${identifier}`;
  const now = Date.now();
  const windowMs = window * 1000;
  
  try {
    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    
    // Remove old entries outside the current window
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    
    // Count requests in the current window
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry on the key
    pipeline.expire(key, window);
    
    const results = await pipeline.exec();
    
    // Extract count from results (second command)
    const count = (results?.[1]?.[1] as number) || 0;
    
    const isAllowed = count < limit;
    const remaining = Math.max(0, limit - count - 1);
    const reset = now + windowMs;
    
    return {
      success: isAllowed,
      remaining,
      limit,
      reset,
      retryAfter: isAllowed ? undefined : Math.ceil(windowMs / 1000),
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if Redis is down
    return {
      success: true,
      remaining: limit,
      limit,
      reset: now + windowMs,
    };
  }
}

/**
 * Get rate limit for IP address
 */
export async function rateLimitByIP(
  ip: string,
  limit: number = 100,
  window: number = 60
): Promise<RateLimitResult> {
  return rateLimit({
    identifier: ip,
    limit,
    window,
    namespace: 'ratelimit:ip',
  });
}

/**
 * Get rate limit for user
 */
export async function rateLimitByUser(
  userId: string,
  limit: number = 200,
  window: number = 60
): Promise<RateLimitResult> {
  return rateLimit({
    identifier: userId,
    limit,
    window,
    namespace: 'ratelimit:user',
  });
}

/**
 * Get rate limit for API key
 */
export async function rateLimitByApiKey(
  apiKey: string,
  limit: number = 1000,
  window: number = 60
): Promise<RateLimitResult> {
  return rateLimit({
    identifier: apiKey,
    limit,
    window,
    namespace: 'ratelimit:apikey',
  });
}

/**
 * Stricter rate limit for auth endpoints (prevent brute force)
 */
export async function rateLimitAuth(
  identifier: string,
  limit: number = 5,
  window: number = 300 // 5 minutes
): Promise<RateLimitResult> {
  return rateLimit({
    identifier,
    limit,
    window,
    namespace: 'ratelimit:auth',
  });
}
