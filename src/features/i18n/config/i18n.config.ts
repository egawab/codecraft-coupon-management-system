/**
 * i18n Configuration
 * Multi-language support setup
 */

export const I18N_CONFIG = {
  // Default locale
  defaultLocale: 'en',
  
  // Supported locales
  locales: [
    { code: 'en', name: 'English', flag: '🇺🇸', rtl: false },
    { code: 'es', name: 'Español', flag: '🇪🇸', rtl: false },
    { code: 'fr', name: 'Français', flag: '🇫🇷', rtl: false },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', rtl: false },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
    { code: 'zh', name: '中文', flag: '🇨🇳', rtl: false },
    { code: 'ja', name: '日本語', flag: '🇯🇵', rtl: false },
    { code: 'pt', name: 'Português', flag: '🇵🇹', rtl: false },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', rtl: false },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', rtl: false },
  ],
  
  // Fallback locale
  fallbackLocale: 'en',
  
  // Auto-detect locale from browser
  autoDetect: true,
  
  // Store locale preference
  persistLocale: true,
  
  // Namespaces for translations
  namespaces: [
    'common',      // Common UI text
    'auth',        // Authentication
    'coupons',     // Coupon-related
    'stores',      // Store-related
    'dashboard',   // Dashboard
    'errors',      // Error messages
    'validation',  // Form validation
    'emails',      // Email templates
  ],
  
  // Default namespace
  defaultNamespace: 'common',
  
  // Interpolation config
  interpolation: {
    escapeValue: false, // React already escapes
    prefix: '{{',
    suffix: '}}',
  },
} as const;

/**
 * Locale metadata
 */
export interface LocaleMetadata {
  code: string;
  name: string;
  flag: string;
  rtl: boolean;
}

/**
 * Get locale by code
 */
export function getLocale(code: string): LocaleMetadata | undefined {
  return I18N_CONFIG.locales.find((l) => l.code === code);
}

/**
 * Check if locale is RTL
 */
export function isRTL(locale: string): boolean {
  const localeData = getLocale(locale);
  return localeData?.rtl ?? false;
}

/**
 * Get browser locale
 */
export function getBrowserLocale(): string {
  if (typeof navigator === 'undefined') return I18N_CONFIG.defaultLocale;
  
  const browserLang = navigator.language.split('-')[0];
  const supported = I18N_CONFIG.locales.find((l) => l.code === browserLang);
  
  return supported ? browserLang : I18N_CONFIG.defaultLocale;
}
