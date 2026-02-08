/**
 * Feature Engineering for ML Models
 * Extracts and transforms features for predictions
 */

import type { FeatureVector, UserPreferences } from '../types/recommendation.types';

/**
 * Extract user features
 */
export function extractUserFeatures(
  userId: string,
  preferences: UserPreferences,
  behaviorHistory: any[]
): number[] {
  const features: number[] = [];

  // User activity score (0-1)
  const activityScore = calculateActivityScore(behaviorHistory);
  features.push(activityScore);

  // Category affinity (one-hot encoded top 10 categories)
  const categoryAffinity = encodeCategoryAffinity(preferences.preferredCategories);
  features.push(...categoryAffinity);

  // Store affinity (one-hot encoded top 10 stores)
  const storeAffinity = encodeStoreAffinity(preferences.preferredStores);
  features.push(...storeAffinity);

  // Average discount preference
  const avgDiscountPref = normalizeDiscountPreference(preferences.priceRange);
  features.push(avgDiscountPref);

  // Location score
  const locationScore = encodeLocation(preferences.location);
  features.push(locationScore);

  // Activity level (encoded)
  const activityLevelEncoded = encodeActivityLevel(preferences.activityLevel);
  features.push(activityLevelEncoded);

  return features;
}

/**
 * Extract coupon features
 */
export function extractCouponFeatures(coupon: any): number[] {
  const features: number[] = [];

  // Discount value (normalized)
  const normalizedDiscount = normalizeCouponDiscount(
    coupon.discountValue,
    coupon.type
  );
  features.push(normalizedDiscount);

  // Coupon type (one-hot encoded)
  const typeEncoded = encodeCouponType(coupon.type);
  features.push(...typeEncoded);

  // Popularity score
  const popularityScore = calculatePopularityScore(
    coupon.usageCount,
    coupon.views
  );
  features.push(popularityScore);

  // Recency score (days since created)
  const recencyScore = calculateRecencyScore(coupon.createdAt);
  features.push(recencyScore);

  // Days until expiry
  const daysUntilExpiry = calculateDaysUntilExpiry(coupon.expiryDate);
  features.push(daysUntilExpiry);

  // Category (encoded)
  const categoryEncoded = encodeCategoryId(coupon.categoryId);
  features.push(categoryEncoded);

  // Is featured (0 or 1)
  features.push(coupon.isFeatured ? 1 : 0);

  return features;
}

/**
 * Extract context features
 */
export function extractContextFeatures(context?: any): number[] {
  const features: number[] = [];
  const now = new Date();

  // Time of day (0-1, normalized)
  const timeOfDay = now.getHours() / 24;
  features.push(timeOfDay);

  // Day of week (0-6, normalized)
  const dayOfWeek = now.getDay() / 7;
  features.push(dayOfWeek);

  // Is weekend (0 or 1)
  const isWeekend = now.getDay() === 0 || now.getDay() === 6 ? 1 : 0;
  features.push(isWeekend);

  // Seasonality (0-1, based on month)
  const seasonality = (now.getMonth() % 3) / 3;
  features.push(seasonality);

  // Context-specific features
  if (context?.currentPage) {
    const pageEncoded = encodePageContext(context.currentPage);
    features.push(pageEncoded);
  } else {
    features.push(0);
  }

  return features;
}

/**
 * Create complete feature vector
 */
export function createFeatureVector(
  userId: string,
  coupon: any,
  preferences: UserPreferences,
  behaviorHistory: any[],
  context?: any
): FeatureVector {
  const userFeatures = extractUserFeatures(userId, preferences, behaviorHistory);
  const couponFeatures = extractCouponFeatures(coupon);
  const contextFeatures = extractContextFeatures(context);

  return {
    // User features
    userActivityScore: userFeatures[0],
    userCategoryAffinity: userFeatures.slice(1, 11),
    userStoreAffinity: userFeatures.slice(11, 21),
    userAvgDiscountPreference: userFeatures[21],
    userLocationScore: userFeatures[22],

    // Coupon features
    couponDiscountValue: couponFeatures[0],
    couponType: couponFeatures[1],
    couponPopularity: couponFeatures[6],
    couponRecency: couponFeatures[7],
    couponDaysUntilExpiry: couponFeatures[8],
    couponCategoryId: couponFeatures[9],

    // Context features
    timeOfDay: contextFeatures[0],
    dayOfWeek: contextFeatures[1],
    isWeekend: contextFeatures[2],
    seasonality: contextFeatures[3],
  };
}

// ============================================
// Helper Functions
// ============================================

function calculateActivityScore(behaviorHistory: any[]): number {
  // Calculate based on number of interactions in last 30 days
  const recentBehavior = behaviorHistory.filter((event) => {
    const eventDate = new Date(event.timestamp);
    const daysAgo = (Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  });

  // Normalize to 0-1
  return Math.min(recentBehavior.length / 100, 1);
}

function encodeCategoryAffinity(categories: string[]): number[] {
  // One-hot encode top 10 categories
  const encoded = new Array(10).fill(0);
  categories.slice(0, 10).forEach((_, index) => {
    encoded[index] = 1;
  });
  return encoded;
}

function encodeStoreAffinity(stores: string[]): number[] {
  // One-hot encode top 10 stores
  const encoded = new Array(10).fill(0);
  stores.slice(0, 10).forEach((_, index) => {
    encoded[index] = 1;
  });
  return encoded;
}

function normalizeDiscountPreference(priceRange: { min: number; max: number }): number {
  // Normalize to 0-1
  return Math.min(priceRange.max / 1000, 1);
}

function encodeLocation(location: { countryId: string; cityId?: string }): number {
  // Simple location encoding (could be improved with embeddings)
  return location.cityId ? 1 : 0.5;
}

function encodeActivityLevel(level: 'low' | 'medium' | 'high'): number {
  const mapping = { low: 0.33, medium: 0.66, high: 1.0 };
  return mapping[level];
}

function normalizeCouponDiscount(value: number, type: string): number {
  if (type === 'PERCENTAGE') {
    return value / 100;
  }
  // For fixed amount, normalize to typical range
  return Math.min(value / 100, 1);
}

function encodeCouponType(type: string): number[] {
  const types = ['PERCENTAGE', 'FIXED_AMOUNT', 'BUY_ONE_GET_ONE', 'FREE_SHIPPING', 'OTHER'];
  const encoded = new Array(5).fill(0);
  const index = types.indexOf(type);
  if (index !== -1) {
    encoded[index] = 1;
  }
  return encoded;
}

function calculatePopularityScore(usageCount: number, views: number): number {
  // Simple popularity calculation
  const ctr = views > 0 ? usageCount / views : 0;
  return Math.min(ctr * 10, 1);
}

function calculateRecencyScore(createdAt: string): number {
  const daysAgo = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  // Newer is better, exponential decay
  return Math.exp(-daysAgo / 30);
}

function calculateDaysUntilExpiry(expiryDate: string): number {
  const days = (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  // Normalize to 0-1 (assuming max 90 days)
  return Math.min(Math.max(days / 90, 0), 1);
}

function encodeCategoryId(categoryId: string): number {
  // Simple hash encoding (could be improved with embeddings)
  return categoryId ? (categoryId.charCodeAt(0) % 100) / 100 : 0;
}

function encodePageContext(page: string): number {
  const pages = ['home', 'category', 'store', 'coupon'];
  const index = pages.indexOf(page);
  return index !== -1 ? index / pages.length : 0;
}
