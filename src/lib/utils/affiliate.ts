import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';

/**
 * Generate a unique affiliate code
 * Format: AFF-XXXXXX (e.g., AFF-A3B9K2)
 */
export function generateAffiliateCode(): string {
  const randomPart = nanoid(6).toUpperCase();
  return `AFF-${randomPart}`;
}

/**
 * Generate a unique tracking code for affiliate links
 * Format: TRK-XXXXXXXXXX (e.g., TRK-A3B9K2L5M8)
 */
export function generateTrackingCode(): string {
  const randomPart = nanoid(10).toUpperCase();
  return `TRK-${randomPart}`;
}

/**
 * Generate a unique cookie ID for attribution tracking
 * Format: 32-character random string
 */
export function generateCookieId(): string {
  return nanoid(32);
}

/**
 * Calculate commission amount based on order value and commission rate
 */
export function calculateCommission(orderValue: number, commissionRate: number): number {
  return Number((orderValue * (commissionRate / 100)).toFixed(2));
}

/**
 * Calculate CTR (Click-Through Rate)
 */
export function calculateCTR(clicks: number, conversions: number): number {
  if (clicks === 0) return 0;
  return Number(((conversions / clicks) * 100).toFixed(2));
}

/**
 * Get cookie expiration date (30 days from now)
 */
export function getAttributionCookieExpiry(): Date {
  const now = new Date();
  now.setDate(now.getDate() + 30);
  return now;
}

/**
 * Parse affiliate cookie value
 */
export function parseAffiliateCookie(cookieValue: string): {
  affiliateLinkId: string;
  cookieId: string;
  timestamp: number;
} | null {
  try {
    return JSON.parse(cookieValue);
  } catch {
    return null;
  }
}

/**
 * Create affiliate cookie value
 */
export function createAffiliateCookieValue(affiliateLinkId: string, cookieId: string): string {
  return JSON.stringify({
    affiliateLinkId,
    cookieId,
    timestamp: Date.now(),
  });
}

/**
 * Check if a commission should be moved from pending to available
 * Default: 30 days after conversion
 */
export function shouldApproveCommission(convertedAt: Date, approvalPeriodDays: number = 30): boolean {
  const now = new Date();
  const approvalDate = new Date(convertedAt);
  approvalDate.setDate(approvalDate.getDate() + approvalPeriodDays);
  return now >= approvalDate;
}

/**
 * Helper function to track conversion from cookie
 */
export async function trackConversionFromCookie(
  cookieValue: string,
  couponId?: string,
  orderValue?: number,
  userId?: string
) {
  const cookieData = parseAffiliateCookie(cookieValue);
  if (!cookieData) {
    return null;
  }

  const { affiliateLinkId, cookieId } = cookieData;

  // Check if conversion already exists for this cookie
  const existingConversion = await prisma.affiliateConversion.findFirst({
    where: { cookieId },
  });

  if (existingConversion) {
    return null; // Already converted
  }

  // Find the original click
  const click = await prisma.affiliateClick.findFirst({
    where: {
      affiliateLinkId,
      cookieId,
    },
    include: {
      affiliateLink: {
        include: {
          affiliate: true,
        },
      },
    },
  });

  if (!click) {
    return null;
  }

  // Get commission rate
  const commissionRate = click.affiliateLink.affiliate.defaultCommissionRate;
  const commissionAmount = orderValue ? calculateCommission(orderValue, commissionRate) : 0;

  // Create conversion
  const conversion = await prisma.$transaction(async (tx) => {
    const newConversion = await tx.affiliateConversion.create({
      data: {
        affiliateLinkId,
        affiliateId: click.affiliateId,
        clickId: click.id,
        couponId: couponId || null,
        userId: userId || null,
        orderValue: orderValue || null,
        commissionRate,
        commissionAmount,
        cookieId,
        isPending: true,
      },
    });

    // Update affiliate link stats
    await tx.affiliateLink.update({
      where: { id: affiliateLinkId },
      data: {
        totalConversions: { increment: 1 },
        totalEarnings: { increment: commissionAmount },
      },
    });

    // Update affiliate pending balance
    await tx.affiliate.update({
      where: { id: click.affiliateId },
      data: {
        pendingBalance: { increment: commissionAmount },
        totalEarnings: { increment: commissionAmount },
      },
    });

    return newConversion;
  });

  return conversion;
}
