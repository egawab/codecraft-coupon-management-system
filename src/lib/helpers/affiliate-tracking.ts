import { cookies } from 'next/headers';
import { parseAffiliateCookie } from '@/lib/utils/affiliate';
import { trackConversionFromCookie } from '@/app/api/affiliate/conversions/route';

/**
 * Helper to track affiliate conversion when a coupon is used
 * Call this after a successful purchase/coupon redemption
 */
export async function trackAffiliateConversion(
  couponId: string,
  orderValue?: number,
  userId?: string
) {
  try {
    const cookieStore = cookies();
    const affiliateCookie = cookieStore.get('affiliate_ref');

    if (!affiliateCookie?.value) {
      // No affiliate attribution
      return null;
    }

    // Track the conversion
    const conversion = await trackConversionFromCookie(
      affiliateCookie.value,
      couponId,
      orderValue,
      userId
    );

    if (conversion) {
      console.log('Affiliate conversion tracked:', conversion.id);
    }

    return conversion;
  } catch (error) {
    console.error('Failed to track affiliate conversion:', error);
    return null;
  }
}

/**
 * Helper to get affiliate info from request cookie
 */
export function getAffiliateFromCookie(): {
  affiliateLinkId: string;
  cookieId: string;
  timestamp: number;
} | null {
  try {
    const cookieStore = cookies();
    const affiliateCookie = cookieStore.get('affiliate_ref');

    if (!affiliateCookie?.value) {
      return null;
    }

    return parseAffiliateCookie(affiliateCookie.value);
  } catch (error) {
    console.error('Failed to get affiliate from cookie:', error);
    return null;
  }
}
