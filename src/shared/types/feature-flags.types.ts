/**
 * Feature flags for progressive rollout
 */

export interface FeatureFlags {
  // PWA Features
  pwa_enabled: boolean;
  pwa_offline_mode: boolean;
  pwa_install_prompt: boolean;
  
  // Push Notifications
  push_notifications_enabled: boolean;
  push_web_enabled: boolean;
  push_mobile_enabled: boolean;
  
  // AI Features
  ai_recommendations_enabled: boolean;
  ai_search_enabled: boolean;
  ai_personalization_enabled: boolean;
  
  // Loyalty System
  loyalty_system_enabled: boolean;
  loyalty_points_enabled: boolean;
  loyalty_rewards_enabled: boolean;
  loyalty_achievements_enabled: boolean;
  
  // Multi-language
  i18n_enabled: boolean;
  i18n_auto_detect: boolean;
  i18n_rtl_support: boolean;
  
  // Analytics
  advanced_analytics_enabled: boolean;
  behavior_tracking_enabled: boolean;
  
  // Social Features
  social_sharing_enabled: boolean;
  user_reviews_enabled: boolean;
  
  // Payment Features
  wallet_enabled: boolean;
  crypto_payments_enabled: boolean;
}

/**
 * Default feature flags
 */
export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  // PWA Features
  pwa_enabled: false,
  pwa_offline_mode: false,
  pwa_install_prompt: false,
  
  // Push Notifications
  push_notifications_enabled: false,
  push_web_enabled: false,
  push_mobile_enabled: false,
  
  // AI Features
  ai_recommendations_enabled: false,
  ai_search_enabled: false,
  ai_personalization_enabled: false,
  
  // Loyalty System
  loyalty_system_enabled: false,
  loyalty_points_enabled: false,
  loyalty_rewards_enabled: false,
  loyalty_achievements_enabled: false,
  
  // Multi-language
  i18n_enabled: false,
  i18n_auto_detect: false,
  i18n_rtl_support: false,
  
  // Analytics
  advanced_analytics_enabled: true,
  behavior_tracking_enabled: true,
  
  // Social Features
  social_sharing_enabled: true,
  user_reviews_enabled: true,
  
  // Payment Features
  wallet_enabled: false,
  crypto_payments_enabled: false,
};

/**
 * Feature flag service interface
 */
export interface FeatureFlagService {
  isEnabled(flag: keyof FeatureFlags): boolean;
  getFlags(): FeatureFlags;
  updateFlags(flags: Partial<FeatureFlags>): void;
}
