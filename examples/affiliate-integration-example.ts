/**
 * Example: How to integrate affiliate tracking in your existing code
 */

import { NextRequest, NextResponse } from 'next/server';
import { trackAffiliateConversion } from '@/lib/helpers/affiliate-tracking';
import { successResponse } from '@/lib/api-response';

// ============================================
// EXAMPLE 1: Track conversion on coupon redemption
// ============================================

export async function POST_RedeemCoupon(request: NextRequest) {
  const { couponId, userId } = await request.json();

  // Your existing coupon redemption logic
  const redemption = {
    id: 'redemption-123',
    couponId,
    userId,
    redeemedAt: new Date(),
  };

  // ✅ ADD THIS: Track affiliate conversion
  await trackAffiliateConversion(
    couponId,
    undefined, // No order value for simple redemption
    userId
  );

  return successResponse(redemption);
}

// ============================================
// EXAMPLE 2: Track conversion on order creation
// ============================================

export async function POST_CreateOrder(request: NextRequest) {
  const { items, couponId, userId, total } = await request.json();

  // Your existing order creation logic
  const order = {
    id: 'order-123',
    userId,
    total,
    couponId,
    createdAt: new Date(),
  };

  // ✅ ADD THIS: Track affiliate conversion with order value
  if (couponId) {
    await trackAffiliateConversion(
      couponId,
      total, // Order value for commission calculation
      userId
    );
  }

  return successResponse(order);
}

// ============================================
// EXAMPLE 3: Track conversion on checkout completion
// ============================================

export async function POST_CompleteCheckout(request: NextRequest) {
  const { orderId } = await request.json();

  // Get order from database
  const order = await getOrder(orderId);

  // Process payment
  const payment = await processPayment(order);

  // ✅ ADD THIS: Track affiliate conversion after successful payment
  if (payment.success && order.couponId) {
    await trackAffiliateConversion(
      order.couponId,
      order.total,
      order.userId
    );
  }

  return successResponse({ order, payment });
}

// ============================================
// EXAMPLE 4: Manual conversion tracking (if you need more control)
// ============================================

import { prisma } from '@/lib/prisma';
import { parseAffiliateCookie, calculateCommission } from '@/lib/utils/affiliate';
import { cookies } from 'next/headers';

export async function POST_ManualConversion(request: NextRequest) {
  const { couponId, orderValue, userId } = await request.json();

  // Get affiliate cookie
  const cookieStore = cookies();
  const affiliateCookie = cookieStore.get('affiliate_ref');

  if (!affiliateCookie?.value) {
    // No affiliate attribution
    return successResponse({ tracked: false });
  }

  // Parse cookie data
  const cookieData = parseAffiliateCookie(affiliateCookie.value);
  if (!cookieData) {
    return successResponse({ tracked: false });
  }

  const { affiliateLinkId, cookieId } = cookieData;

  // Check for duplicate conversion
  const existingConversion = await prisma.affiliateConversion.findFirst({
    where: { cookieId },
  });

  if (existingConversion) {
    return successResponse({ tracked: false, reason: 'Already converted' });
  }

  // Get affiliate link and rate
  const affiliateLink = await prisma.affiliateLink.findUnique({
    where: { id: affiliateLinkId },
    include: { affiliate: true },
  });

  if (!affiliateLink) {
    return successResponse({ tracked: false, reason: 'Link not found' });
  }

  // Calculate commission
  const commissionRate = affiliateLink.affiliate.defaultCommissionRate;
  const commissionAmount = calculateCommission(orderValue, commissionRate);

  // Create conversion in transaction
  const conversion = await prisma.$transaction(async (tx) => {
    // Create conversion record
    const newConversion = await tx.affiliateConversion.create({
      data: {
        affiliateLinkId,
        affiliateId: affiliateLink.affiliateId,
        couponId,
        userId,
        orderValue,
        commissionRate,
        commissionAmount,
        cookieId,
        isPending: true,
      },
    });

    // Update link stats
    await tx.affiliateLink.update({
      where: { id: affiliateLinkId },
      data: {
        totalConversions: { increment: 1 },
        totalEarnings: { increment: commissionAmount },
      },
    });

    // Update affiliate balance
    await tx.affiliate.update({
      where: { id: affiliateLink.affiliateId },
      data: {
        pendingBalance: { increment: commissionAmount },
        totalEarnings: { increment: commissionAmount },
      },
    });

    return newConversion;
  });

  return successResponse({ tracked: true, conversion });
}

// ============================================
// EXAMPLE 5: Get affiliate info from current request
// ============================================

import { getAffiliateFromCookie } from '@/lib/helpers/affiliate-tracking';

export async function GET_CheckAffiliate(request: NextRequest) {
  const affiliateInfo = getAffiliateFromCookie();

  if (affiliateInfo) {
    return successResponse({
      hasAffiliate: true,
      affiliateLinkId: affiliateInfo.affiliateLinkId,
      timestamp: new Date(affiliateInfo.timestamp),
    });
  }

  return successResponse({ hasAffiliate: false });
}

// ============================================
// EXAMPLE 6: Create affiliate link programmatically
// ============================================

import { generateTrackingCode } from '@/lib/utils/affiliate';

export async function POST_CreateAffiliateLink(
  affiliateId: string,
  couponId?: string
) {
  // Generate unique tracking code
  let trackingCode = generateTrackingCode();
  
  // Ensure uniqueness
  let exists = await prisma.affiliateLink.findUnique({
    where: { trackingCode },
  });

  while (exists) {
    trackingCode = generateTrackingCode();
    exists = await prisma.affiliateLink.findUnique({
      where: { trackingCode },
    });
  }

  // Create link
  const link = await prisma.affiliateLink.create({
    data: {
      affiliateId,
      couponId: couponId || null,
      trackingCode,
    },
  });

  // Generate full URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}/go/${trackingCode}`;

  return {
    ...link,
    url: fullUrl,
  };
}

// ============================================
// EXAMPLE 7: Display affiliate links in UI
// ============================================

export function AffiliateLinkCard({ link }: { link: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-mono text-sm text-gray-600">{link.trackingCode}</p>
          {link.coupon && (
            <p className="font-semibold">{link.coupon.title}</p>
          )}
        </div>
        <button onClick={handleCopy} className="btn-primary">
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-600">Clicks</p>
          <p className="text-2xl font-bold">{link.totalClicks}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Conversions</p>
          <p className="text-2xl font-bold">{link.totalConversions}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">CTR</p>
          <p className="text-2xl font-bold">
            {link.totalClicks > 0 
              ? ((link.totalConversions / link.totalClicks) * 100).toFixed(2)
              : 0}%
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Earnings</p>
          <p className="text-2xl font-bold text-green-600">
            ${link.totalEarnings.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Helper functions (mock - replace with your actual implementations)
// ============================================

async function getOrder(orderId: string) {
  return {
    id: orderId,
    userId: 'user-123',
    total: 100,
    couponId: 'coupon-123',
  };
}

async function processPayment(order: any) {
  return { success: true };
}
