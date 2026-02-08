/**
 * Loyalty system configuration
 */

import { LoyaltyTier, PointTransactionType, AchievementCategory } from '../types/loyalty.types';
import type { TierBenefits } from '../types/loyalty.types';

/**
 * Tier benefits configuration
 */
export const TIER_BENEFITS: Record<LoyaltyTier, TierBenefits> = {
  [LoyaltyTier.BRONZE]: {
    tier: LoyaltyTier.BRONZE,
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 999,
    benefits: [
      'Earn 1 point per coupon used',
      'Access to basic rewards',
      'Monthly newsletter',
    ],
    pointsMultiplier: 1.0,
    specialPerks: [],
    color: '#CD7F32',
    icon: '🥉',
  },
  [LoyaltyTier.SILVER]: {
    tier: LoyaltyTier.SILVER,
    name: 'Silver',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: [
      'Earn 1.5x points per coupon',
      'Early access to exclusive deals',
      'Priority customer support',
    ],
    pointsMultiplier: 1.5,
    specialPerks: ['Exclusive deals notifications'],
    color: '#C0C0C0',
    icon: '🥈',
  },
  [LoyaltyTier.GOLD]: {
    tier: LoyaltyTier.GOLD,
    name: 'Gold',
    minPoints: 5000,
    maxPoints: 14999,
    benefits: [
      'Earn 2x points per coupon',
      'Free featured coupon listing (1/month)',
      'VIP customer support',
      'Birthday rewards',
    ],
    pointsMultiplier: 2.0,
    specialPerks: ['Monthly featured listing', 'Birthday bonus points'],
    color: '#FFD700',
    icon: '🥇',
  },
  [LoyaltyTier.PLATINUM]: {
    tier: LoyaltyTier.PLATINUM,
    name: 'Platinum',
    minPoints: 15000,
    maxPoints: 49999,
    benefits: [
      'Earn 2.5x points per coupon',
      'Free featured listings (3/month)',
      'Dedicated account manager',
      'Exclusive events access',
      'Custom rewards',
    ],
    pointsMultiplier: 2.5,
    specialPerks: [
      'Quarterly featured listings',
      'Beta features access',
      'Exclusive events',
    ],
    color: '#E5E4E2',
    icon: '💎',
  },
  [LoyaltyTier.DIAMOND]: {
    tier: LoyaltyTier.DIAMOND,
    name: 'Diamond',
    minPoints: 50000,
    maxPoints: null,
    benefits: [
      'Earn 3x points per coupon',
      'Unlimited featured listings',
      'Personal concierge service',
      'All premium features',
      'Lifetime benefits',
    ],
    pointsMultiplier: 3.0,
    specialPerks: [
      'Unlimited featured listings',
      'Personal concierge',
      'Lifetime benefits',
      'Exclusive partner perks',
    ],
    color: '#B9F2FF',
    icon: '💠',
  },
};

/**
 * Points earning rules
 */
export const POINTS_EARNING = {
  [PointTransactionType.EARN_COUPON_USE]: 10,
  [PointTransactionType.EARN_REVIEW]: 5,
  [PointTransactionType.EARN_REFERRAL]: 50,
  [PointTransactionType.EARN_DAILY_LOGIN]: 1,
  [PointTransactionType.EARN_ACHIEVEMENT]: 0, // Variable based on achievement
};

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS = [
  // Savings category
  {
    id: 'first_save',
    name: 'First Steps',
    description: 'Use your first coupon',
    category: AchievementCategory.SAVINGS,
    icon: '🎯',
    points: 10,
    condition: { type: 'coupon_use', target: 1 },
    isSecret: false,
    order: 1,
  },
  {
    id: 'savvy_saver',
    name: 'Savvy Saver',
    description: 'Use 10 coupons',
    category: AchievementCategory.SAVINGS,
    icon: '💰',
    points: 50,
    condition: { type: 'coupon_use', target: 10 },
    isSecret: false,
    order: 2,
  },
  {
    id: 'master_saver',
    name: 'Master Saver',
    description: 'Use 100 coupons',
    category: AchievementCategory.SAVINGS,
    icon: '👑',
    points: 500,
    condition: { type: 'coupon_use', target: 100 },
    isSecret: false,
    order: 3,
  },
  
  // Social category
  {
    id: 'first_review',
    name: 'Helpful Voice',
    description: 'Write your first review',
    category: AchievementCategory.SOCIAL,
    icon: '✍️',
    points: 15,
    condition: { type: 'review_count', target: 1 },
    isSecret: false,
    order: 4,
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Refer 5 friends',
    category: AchievementCategory.SOCIAL,
    icon: '🦋',
    points: 100,
    condition: { type: 'referral_count', target: 5 },
    isSecret: false,
    order: 5,
  },
  
  // Explorer category
  {
    id: 'category_explorer',
    name: 'Category Explorer',
    description: 'Use coupons from 5 different categories',
    category: AchievementCategory.EXPLORER,
    icon: '🗺️',
    points: 30,
    condition: { type: 'unique_categories', target: 5 },
    isSecret: false,
    order: 6,
  },
  {
    id: 'store_hopper',
    name: 'Store Hopper',
    description: 'Use coupons from 20 different stores',
    category: AchievementCategory.EXPLORER,
    icon: '🏪',
    points: 75,
    condition: { type: 'unique_stores', target: 20 },
    isSecret: false,
    order: 7,
  },
  
  // Loyalty category
  {
    id: 'seven_day_streak',
    name: 'Week Warrior',
    description: 'Log in for 7 consecutive days',
    category: AchievementCategory.LOYALTY,
    icon: '🔥',
    points: 25,
    condition: { type: 'login_streak', target: 7 },
    isSecret: false,
    order: 8,
  },
  {
    id: 'thirty_day_streak',
    name: 'Monthly Master',
    description: 'Log in for 30 consecutive days',
    category: AchievementCategory.LOYALTY,
    icon: '⚡',
    points: 100,
    condition: { type: 'login_streak', target: 30 },
    isSecret: false,
    order: 9,
  },
  
  // Special/Secret achievements
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Use a coupon between midnight and 6 AM',
    category: AchievementCategory.SPECIAL,
    icon: '🦉',
    points: 20,
    condition: { type: 'night_use', target: 1 },
    isSecret: true,
    order: 10,
  },
  {
    id: 'lucky_number',
    name: 'Lucky Number',
    description: 'Use your 777th coupon',
    category: AchievementCategory.SPECIAL,
    icon: '🎰',
    points: 777,
    condition: { type: 'exact_coupon_use', target: 777 },
    isSecret: true,
    order: 11,
  },
];

/**
 * Points expiration (in days)
 */
export const POINTS_EXPIRATION_DAYS = 365;

/**
 * Daily login streak bonus
 */
export const LOGIN_STREAK_BONUS = {
  7: 10,   // 1 week
  30: 50,  // 1 month
  90: 200, // 3 months
  365: 1000, // 1 year
};
