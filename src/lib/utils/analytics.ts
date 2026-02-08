import { nanoid } from 'nanoid';
import { 
  ANALYTICS_KEYS, 
  incrementCounter, 
  getCounter, 
  setSessionMarker 
} from '@/lib/analytics-redis';

/**
 * Get or create session ID for analytics tracking
 */
export function getOrCreateSessionId(cookies: any): string {
  let sessionId = cookies.get('analytics_session_id')?.value;
  
  if (!sessionId) {
    sessionId = nanoid(32);
  }
  
  return sessionId;
}

/**
 * Set session cookie
 */
export function setSessionCookie(sessionId: string): {
  name: string;
  value: string;
  options: any;
} {
  return {
    name: 'analytics_session_id',
    value: sessionId,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    },
  };
}

/**
 * Track coupon view with unique tracking
 */
export async function trackCouponView(
  couponId: string,
  sessionId: string,
  storeId?: string
): Promise<void> {
  // Increment total views
  await incrementCounter(ANALYTICS_KEYS.COUPON_VIEWS(couponId));
  
  // Check and track unique view
  const sessionKey = ANALYTICS_KEYS.SESSION_VIEWED_COUPON(sessionId, couponId);
  const isUnique = await setSessionMarker(sessionKey, 86400); // 24 hours
  
  if (isUnique) {
    await incrementCounter(ANALYTICS_KEYS.COUPON_UNIQUE_VIEWS(couponId));
  }
  
  // Track store views if provided
  if (storeId) {
    await incrementCounter(ANALYTICS_KEYS.STORE_VIEWS(storeId));
    await incrementCounter(ANALYTICS_KEYS.STORE_COUPON_VIEWS(storeId));
  }
}

/**
 * Track coupon code copy with unique tracking
 */
export async function trackCouponCopy(
  couponId: string,
  sessionId: string,
  storeId?: string
): Promise<void> {
  // Increment total copies
  await incrementCounter(ANALYTICS_KEYS.COUPON_COPIES(couponId));
  
  // Check and track unique copy
  const sessionKey = ANALYTICS_KEYS.SESSION_COPIED_COUPON(sessionId, couponId);
  const isUnique = await setSessionMarker(sessionKey, 86400);
  
  if (isUnique) {
    await incrementCounter(ANALYTICS_KEYS.COUPON_UNIQUE_COPIES(couponId));
  }
  
  // Track store analytics
  if (storeId) {
    await incrementCounter(ANALYTICS_KEYS.STORE_COUPON_COPIES(storeId));
  }
}

/**
 * Track coupon click (redirect to store) with unique tracking
 */
export async function trackCouponClick(
  couponId: string,
  sessionId: string,
  storeId?: string
): Promise<void> {
  // Increment total clicks
  await incrementCounter(ANALYTICS_KEYS.COUPON_CLICKS(couponId));
  
  // Check and track unique click
  const sessionKey = ANALYTICS_KEYS.SESSION_CLICKED_COUPON(sessionId, couponId);
  const isUnique = await setSessionMarker(sessionKey, 86400);
  
  if (isUnique) {
    await incrementCounter(ANALYTICS_KEYS.COUPON_UNIQUE_CLICKS(couponId));
  }
  
  // Track store analytics
  if (storeId) {
    await incrementCounter(ANALYTICS_KEYS.STORE_COUPON_CLICKS(storeId));
  }
}

/**
 * Get current analytics counts from Redis (real-time)
 */
export async function getCouponAnalytics(couponId: string): Promise<{
  views: number;
  copies: number;
  clicks: number;
  uniqueViews: number;
  uniqueCopies: number;
  uniqueClicks: number;
}> {
  const [views, copies, clicks, uniqueViews, uniqueCopies, uniqueClicks] = await Promise.all([
    getCounter(ANALYTICS_KEYS.COUPON_VIEWS(couponId)),
    getCounter(ANALYTICS_KEYS.COUPON_COPIES(couponId)),
    getCounter(ANALYTICS_KEYS.COUPON_CLICKS(couponId)),
    getCounter(ANALYTICS_KEYS.COUPON_UNIQUE_VIEWS(couponId)),
    getCounter(ANALYTICS_KEYS.COUPON_UNIQUE_COPIES(couponId)),
    getCounter(ANALYTICS_KEYS.COUPON_UNIQUE_CLICKS(couponId)),
  ]);
  
  return {
    views,
    copies,
    clicks,
    uniqueViews,
    uniqueCopies,
    uniqueClicks,
  };
}

/**
 * Get store analytics from Redis
 */
export async function getStoreAnalytics(storeId: string): Promise<{
  views: number;
  couponViews: number;
  couponCopies: number;
  couponClicks: number;
}> {
  const [views, couponViews, couponCopies, couponClicks] = await Promise.all([
    getCounter(ANALYTICS_KEYS.STORE_VIEWS(storeId)),
    getCounter(ANALYTICS_KEYS.STORE_COUPON_VIEWS(storeId)),
    getCounter(ANALYTICS_KEYS.STORE_COUPON_COPIES(storeId)),
    getCounter(ANALYTICS_KEYS.STORE_COUPON_CLICKS(storeId)),
  ]);
  
  return {
    views,
    couponViews,
    couponCopies,
    couponClicks,
  };
}

/**
 * Calculate conversion rate
 */
export function calculateConversionRate(
  actions: number,
  views: number
): number {
  if (views === 0) return 0;
  return Number(((actions / views) * 100).toFixed(2));
}

/**
 * Get analytics summary with calculated metrics
 */
export async function getCouponAnalyticsSummary(couponId: string) {
  const analytics = await getCouponAnalytics(couponId);
  
  return {
    ...analytics,
    copyRate: calculateConversionRate(analytics.copies, analytics.views),
    clickRate: calculateConversionRate(analytics.clicks, analytics.views),
    clickThroughRate: calculateConversionRate(analytics.clicks, analytics.copies),
  };
}
