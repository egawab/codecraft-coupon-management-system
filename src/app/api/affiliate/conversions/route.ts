import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { trackConversionSchema } from '@/lib/validations/affiliate';
import { calculateCommission, parseAffiliateCookie } from '@/lib/utils/affiliate';
import { errorResponse, successResponse } from '@/lib/api-response';
import { UnauthorizedError, ValidationError, NotFoundError } from '@/lib/errors';

/**
 * POST /api/affiliate/conversions
 * Track an affiliate conversion (internal API - called when user makes a purchase)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = trackConversionSchema.safeParse(body);
    if (!validationResult.success) {
      return errorResponse(
        new ValidationError(validationResult.error.errors[0]?.message || 'Invalid input')
      );
    }

    const { affiliateLinkId, couponId, orderValue, userId } = validationResult.data;

    // Find affiliate link
    const affiliateLink = await prisma.affiliateLink.findUnique({
      where: { id: affiliateLinkId },
      include: {
        affiliate: true,
      },
    });

    if (!affiliateLink) {
      return errorResponse(new NotFoundError('Affiliate link not found'));
    }

    // Get commission rate
    const commissionRate = affiliateLink.affiliate.defaultCommissionRate;
    const commissionAmount = orderValue ? calculateCommission(orderValue, commissionRate) : 0;

    // Create conversion record
    const conversion = await prisma.$transaction(async (tx) => {
      const newConversion = await tx.affiliateConversion.create({
        data: {
          affiliateLinkId,
          affiliateId: affiliateLink.affiliateId,
          couponId: couponId || null,
          userId: userId || null,
          orderValue: orderValue || null,
          commissionRate,
          commissionAmount,
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
        where: { id: affiliateLink.affiliateId },
        data: {
          pendingBalance: { increment: commissionAmount },
          totalEarnings: { increment: commissionAmount },
        },
      });

      return newConversion;
    });

    return successResponse(conversion, 'Conversion tracked successfully', 201);
  } catch (error) {
    console.error('Track conversion error:', error);
    return errorResponse(error as Error);
  }
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
