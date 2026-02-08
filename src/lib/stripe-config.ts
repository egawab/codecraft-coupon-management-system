import { SubscriptionPlan } from '@prisma/client';

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  description: string;
  price: number; // Monthly price in USD
  priceId: string; // Stripe Price ID (to be configured in Stripe Dashboard)
  productId: string; // Stripe Product ID
  features: string[];
  limits: {
    maxStores: number;
    maxCoupons: number;
    maxFeaturedCoupons: number;
    maxFeaturedStores: number;
  };
  trialDays?: number;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, SubscriptionPlanConfig> = {
  [SubscriptionPlan.FREE]: {
    id: SubscriptionPlan.FREE,
    name: 'Free',
    description: 'Get started with basic features',
    price: 0,
    priceId: '', // No price ID for free plan
    productId: '',
    features: [
      '1 Store',
      'Up to 10 coupons',
      'Basic analytics',
      'Community support',
    ],
    limits: {
      maxStores: 1,
      maxCoupons: 10,
      maxFeaturedCoupons: 0,
      maxFeaturedStores: 0,
    },
  },
  [SubscriptionPlan.BASIC]: {
    id: SubscriptionPlan.BASIC,
    name: 'Basic',
    description: 'Perfect for small businesses',
    price: 9.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    productId: process.env.STRIPE_BASIC_PRODUCT_ID || '',
    features: [
      '3 Stores',
      'Up to 50 coupons',
      'Advanced analytics',
      '1 Featured coupon',
      'Email support',
    ],
    limits: {
      maxStores: 3,
      maxCoupons: 50,
      maxFeaturedCoupons: 1,
      maxFeaturedStores: 0,
    },
    trialDays: 14,
  },
  [SubscriptionPlan.PRO]: {
    id: SubscriptionPlan.PRO,
    name: 'Pro',
    description: 'For growing businesses',
    price: 29.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    productId: process.env.STRIPE_PRO_PRODUCT_ID || '',
    features: [
      '10 Stores',
      'Unlimited coupons',
      'Advanced analytics & reports',
      '5 Featured coupons',
      '2 Featured stores',
      'Priority support',
      'Custom branding',
    ],
    limits: {
      maxStores: 10,
      maxCoupons: -1, // -1 means unlimited
      maxFeaturedCoupons: 5,
      maxFeaturedStores: 2,
    },
    trialDays: 14,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    id: SubscriptionPlan.ENTERPRISE,
    name: 'Enterprise',
    description: 'For large organizations',
    price: 99.99,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    productId: process.env.STRIPE_ENTERPRISE_PRODUCT_ID || '',
    features: [
      'Unlimited stores',
      'Unlimited coupons',
      'Advanced analytics & reports',
      'Unlimited featured coupons',
      'Unlimited featured stores',
      'Dedicated support',
      'Custom branding',
      'API access',
      'White-label options',
    ],
    limits: {
      maxStores: -1, // -1 means unlimited
      maxCoupons: -1,
      maxFeaturedCoupons: -1,
      maxFeaturedStores: -1,
    },
    trialDays: 14,
  },
};

// Featured pricing (one-time payments)
export const FEATURED_PRICING = {
  COUPON_7_DAYS: {
    name: '7 Days Featured Coupon',
    price: 4.99,
    days: 7,
  },
  COUPON_14_DAYS: {
    name: '14 Days Featured Coupon',
    price: 7.99,
    days: 14,
  },
  COUPON_30_DAYS: {
    name: '30 Days Featured Coupon',
    price: 14.99,
    days: 30,
  },
  STORE_7_DAYS: {
    name: '7 Days Featured Store',
    price: 9.99,
    days: 7,
  },
  STORE_14_DAYS: {
    name: '14 Days Featured Store',
    price: 14.99,
    days: 14,
  },
  STORE_30_DAYS: {
    name: '30 Days Featured Store',
    price: 24.99,
    days: 30,
  },
} as const;

export function getPlanConfig(plan: SubscriptionPlan): SubscriptionPlanConfig {
  return SUBSCRIPTION_PLANS[plan];
}

export function getFreePlanConfig(): SubscriptionPlanConfig {
  return SUBSCRIPTION_PLANS[SubscriptionPlan.FREE];
}

export function getAllPlans(): SubscriptionPlanConfig[] {
  return Object.values(SUBSCRIPTION_PLANS);
}
