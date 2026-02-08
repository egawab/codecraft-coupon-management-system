import { prisma } from './prisma';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { getPlanConfig } from './stripe-config';

/**
 * Get user's active subscription
 */
export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING],
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get user's subscription plan (returns FREE if no active subscription)
 */
export async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const subscription = await getUserSubscription(userId);
  return subscription?.plan || SubscriptionPlan.FREE;
}

/**
 * Check if user can create a store
 */
export async function canCreateStore(userId: string): Promise<boolean> {
  const [plan, storeCount] = await Promise.all([
    getUserPlan(userId),
    prisma.store.count({ where: { ownerId: userId } }),
  ]);

  const planConfig = getPlanConfig(plan);
  
  if (planConfig.limits.maxStores === -1) {
    return true; // Unlimited
  }

  return storeCount < planConfig.limits.maxStores;
}

/**
 * Check if user can create a coupon
 */
export async function canCreateCoupon(userId: string): Promise<boolean> {
  const [plan, couponCount] = await Promise.all([
    getUserPlan(userId),
    prisma.coupon.count({ where: { createdById: userId } }),
  ]);

  const planConfig = getPlanConfig(plan);
  
  if (planConfig.limits.maxCoupons === -1) {
    return true; // Unlimited
  }

  return couponCount < planConfig.limits.maxCoupons;
}

/**
 * Check if user can feature a coupon
 */
export async function canFeatureCoupon(userId: string): Promise<boolean> {
  const [plan, featuredCount] = await Promise.all([
    getUserPlan(userId),
    prisma.coupon.count({
      where: {
        createdById: userId,
        isFeatured: true,
        featuredUntil: {
          gte: new Date(),
        },
      },
    }),
  ]);

  const planConfig = getPlanConfig(plan);
  
  if (planConfig.limits.maxFeaturedCoupons === -1) {
    return true; // Unlimited
  }

  return featuredCount < planConfig.limits.maxFeaturedCoupons;
}

/**
 * Check if user can feature a store
 */
export async function canFeatureStore(userId: string): Promise<boolean> {
  const [plan, featuredCount] = await Promise.all([
    getUserPlan(userId),
    prisma.store.count({
      where: {
        ownerId: userId,
        isFeatured: true,
        featuredUntil: {
          gte: new Date(),
        },
      },
    }),
  ]);

  const planConfig = getPlanConfig(plan);
  
  if (planConfig.limits.maxFeaturedStores === -1) {
    return true; // Unlimited
  }

  return featuredCount < planConfig.limits.maxFeaturedStores;
}

/**
 * Get subscription limits for user
 */
export async function getUserLimits(userId: string) {
  const plan = await getUserPlan(userId);
  const planConfig = getPlanConfig(plan);

  const [storeCount, couponCount, featuredCouponCount, featuredStoreCount] = await Promise.all([
    prisma.store.count({ where: { ownerId: userId } }),
    prisma.coupon.count({ where: { createdById: userId } }),
    prisma.coupon.count({
      where: {
        createdById: userId,
        isFeatured: true,
        featuredUntil: { gte: new Date() },
      },
    }),
    prisma.store.count({
      where: {
        ownerId: userId,
        isFeatured: true,
        featuredUntil: { gte: new Date() },
      },
    }),
  ]);

  return {
    plan: planConfig.name,
    limits: planConfig.limits,
    usage: {
      stores: storeCount,
      coupons: couponCount,
      featuredCoupons: featuredCouponCount,
      featuredStores: featuredStoreCount,
    },
    canCreateStore: planConfig.limits.maxStores === -1 || storeCount < planConfig.limits.maxStores,
    canCreateCoupon: planConfig.limits.maxCoupons === -1 || couponCount < planConfig.limits.maxCoupons,
    canFeatureCoupon:
      planConfig.limits.maxFeaturedCoupons === -1 ||
      featuredCouponCount < planConfig.limits.maxFeaturedCoupons,
    canFeatureStore:
      planConfig.limits.maxFeaturedStores === -1 ||
      featuredStoreCount < planConfig.limits.maxFeaturedStores,
  };
}
