import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canCreateStore, canCreateCoupon, getUserLimits } from '@/lib/subscription-helpers';

/**
 * Middleware to check if user can create a store
 */
export async function checkStoreLimit(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const canCreate = await canCreateStore(session.user.id);

  if (!canCreate) {
    const limits = await getUserLimits(session.user.id);
    return NextResponse.json(
      {
        error: 'Store limit reached',
        message: `You have reached the maximum number of stores (${limits.limits.maxStores}) for your plan. Please upgrade to create more stores.`,
        limits,
      },
      { status: 403 }
    );
  }

  return null; // No error, proceed
}

/**
 * Middleware to check if user can create a coupon
 */
export async function checkCouponLimit(_req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const canCreate = await canCreateCoupon(session.user.id);

  if (!canCreate) {
    const limits = await getUserLimits(session.user.id);
    return NextResponse.json(
      {
        error: 'Coupon limit reached',
        message: `You have reached the maximum number of coupons (${limits.limits.maxCoupons}) for your plan. Please upgrade to create more coupons.`,
        limits,
      },
      { status: 403 }
    );
  }

  return null; // No error, proceed
}
