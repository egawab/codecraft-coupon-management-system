/**
 * Loyalty system types
 */

/**
 * Loyalty tier levels
 */
export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}

/**
 * Point transaction types
 */
export enum PointTransactionType {
  EARN_COUPON_USE = 'EARN_COUPON_USE',
  EARN_REVIEW = 'EARN_REVIEW',
  EARN_REFERRAL = 'EARN_REFERRAL',
  EARN_DAILY_LOGIN = 'EARN_DAILY_LOGIN',
  EARN_ACHIEVEMENT = 'EARN_ACHIEVEMENT',
  REDEEM_REWARD = 'REDEEM_REWARD',
  EXPIRE = 'EXPIRE',
  ADMIN_ADJUST = 'ADMIN_ADJUST',
}

/**
 * Achievement category
 */
export enum AchievementCategory {
  SAVINGS = 'SAVINGS',
  SOCIAL = 'SOCIAL',
  EXPLORER = 'EXPLORER',
  LOYALTY = 'LOYALTY',
  SPECIAL = 'SPECIAL',
}

/**
 * Reward type
 */
export enum RewardType {
  DISCOUNT_COUPON = 'DISCOUNT_COUPON',
  EXCLUSIVE_DEAL = 'EXCLUSIVE_DEAL',
  FEATURED_LISTING = 'FEATURED_LISTING',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT',
  CUSTOM = 'CUSTOM',
}

/**
 * Loyalty account
 */
export interface LoyaltyAccount {
  id: string;
  userId: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTier;
  tierProgress: number; // Progress to next tier (0-100)
  nextTierPoints: number;
  expiringPoints: number;
  expiringDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Point transaction
 */
export interface PointTransaction {
  id: string;
  accountId: string;
  type: PointTransactionType;
  points: number;
  balance: number;
  description: string;
  metadata?: Record<string, any>;
  expiresAt?: string | null;
  createdAt: string;
}

/**
 * Loyalty tier benefits
 */
export interface TierBenefits {
  tier: LoyaltyTier;
  name: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: string[];
  pointsMultiplier: number;
  specialPerks: string[];
  color: string;
  icon: string;
}

/**
 * Achievement
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string;
  points: number;
  condition: {
    type: string;
    target: number;
    current?: number;
  };
  isSecret: boolean;
  order: number;
}

/**
 * User achievement
 */
export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  progress: number;
  isCompleted: boolean;
  achievement?: Achievement;
}

/**
 * Reward
 */
export interface Reward {
  id: string;
  name: string;
  description: string;
  type: RewardType;
  pointsCost: number;
  tier: LoyaltyTier | null;
  stock: number | null;
  isActive: boolean;
  imageUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: string | null;
}

/**
 * Reward redemption
 */
export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  pointsSpent: number;
  status: 'pending' | 'approved' | 'delivered' | 'cancelled';
  redeemedAt: string;
  deliveredAt?: string | null;
  reward?: Reward;
}

/**
 * Points summary
 */
export interface PointsSummary {
  total: number;
  pending: number;
  available: number;
  expiring: number;
  expiringDate: string | null;
  earnedThisMonth: number;
  spentThisMonth: number;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  points: number;
  tier: LoyaltyTier;
  badges: string[];
}
