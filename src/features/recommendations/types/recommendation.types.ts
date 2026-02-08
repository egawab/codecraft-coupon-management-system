/**
 * AI Recommendation types
 */

/**
 * User behavior event
 */
export interface BehaviorEvent {
  userId: string;
  eventType: 'view' | 'click' | 'copy' | 'favorite' | 'search';
  couponId?: string;
  storeId?: string;
  categoryId?: string;
  query?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * User preferences derived from behavior
 */
export interface UserPreferences {
  userId: string;
  preferredCategories: string[];
  preferredStores: string[];
  priceRange: {
    min: number;
    max: number;
  };
  discountPreference: 'percentage' | 'fixed_amount' | 'any';
  location: {
    countryId: string;
    cityId?: string;
  };
  activityLevel: 'low' | 'medium' | 'high';
  lastUpdated: string;
}

/**
 * Recommendation request
 */
export interface RecommendationRequest {
  userId: string;
  context?: {
    currentPage?: 'home' | 'category' | 'store' | 'coupon';
    currentCouponId?: string;
    currentStoreId?: string;
    currentCategoryId?: string;
  };
  limit?: number;
  excludeIds?: string[];
}

/**
 * Recommendation result
 */
export interface Recommendation {
  couponId: string;
  score: number;
  reason: RecommendationReason;
  coupon?: any; // Full coupon data
}

/**
 * Recommendation reason
 */
export type RecommendationReason =
  | 'personalized' // Based on user behavior
  | 'trending' // Popular right now
  | 'similar' // Similar to viewed/liked items
  | 'location' // Based on user location
  | 'category' // Based on preferred categories
  | 'store' // From favorite stores
  | 'expiring_soon' // Expiring coupons
  | 'new' // New coupons
  | 'high_value'; // High discount value

/**
 * Model prediction input
 */
export interface ModelInput {
  userFeatures: number[];
  couponFeatures: number[];
  contextFeatures: number[];
}

/**
 * Model prediction output
 */
export interface ModelOutput {
  score: number;
  confidence: number;
}

/**
 * Feature vector for ML model
 */
export interface FeatureVector {
  // User features
  userActivityScore: number;
  userCategoryAffinity: number[];
  userStoreAffinity: number[];
  userAvgDiscountPreference: number;
  userLocationScore: number;
  
  // Coupon features
  couponDiscountValue: number;
  couponType: number; // Encoded
  couponPopularity: number;
  couponRecency: number;
  couponDaysUntilExpiry: number;
  couponCategoryId: number; // Encoded
  
  // Context features
  timeOfDay: number;
  dayOfWeek: number;
  isWeekend: number;
  seasonality: number;
}

/**
 * A/B test variant
 */
export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-1
  config: {
    algorithm: 'collaborative' | 'content_based' | 'hybrid' | 'trending';
    modelVersion?: string;
    parameters?: Record<string, any>;
  };
}

/**
 * Recommendation metrics
 */
export interface RecommendationMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  cvr: number; // Conversion rate
  avgScore: number;
  timestamp: string;
}
