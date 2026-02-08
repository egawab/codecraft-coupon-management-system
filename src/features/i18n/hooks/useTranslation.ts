/**
 * Translation hooks (cross-platform)
 */

import { useState, useEffect, useCallback } from 'react';
import { useUIStore } from '../../../shared/stores/ui.store';
import type { TranslateFunction, TranslationValues } from '../types/i18n.types';

/**
 * Translation storage (will be populated from files/API)
 */
let translations: Record<string, any> = {};

/**
 * Load translations for a locale
 */
async function loadTranslations(locale: string, namespace: string = 'common') {
  try {
    // In production, this would load from server or bundled files
    const response = await fetch(`/locales/${locale}/${namespace}.json`);
    const data = await response.json();
    
    if (!translations[locale]) {
      translations[locale] = {};
    }
    translations[locale][namespace] = data;
    
    return data;
  } catch (error) {
    console.error(`Failed to load translations for ${locale}/${namespace}:`, error);
    return {};
  }
}

/**
 * Hook for translations
 */
export function useTranslation(namespace: string = 'common') {
  const locale = useUIStore((state) => state.locale);
  const setLocale = useUIStore((state) => state.setLocale);
  const [isLoading, setIsLoading] = useState(false);

  // Load translations when locale changes
  useEffect(() => {
    setIsLoading(true);
    loadTranslations(locale, namespace).finally(() => {
      setIsLoading(false);
    });
  }, [locale, namespace]);

  // Translation function
  const t: TranslateFunction = useCallback(
    (key, values, options) => {
      const ns = options?.ns || namespace;
      const defaultValue = options?.defaultValue || key;

      // Get translation from loaded translations
      const translation = translations[locale]?.[ns]?.[key];

      if (!translation) {
        // Fallback to English if available
        const fallback = translations['en']?.[ns]?.[key];
        if (fallback) {
          return interpolate(fallback, values);
        }
        return defaultValue;
      }

      return interpolate(translation, values);
    },
    [locale, namespace]
  );

  // Change locale
  const changeLocale = useCallback(
    async (newLocale: string) => {
      setIsLoading(true);
      try {
        await loadTranslations(newLocale, namespace);
        setLocale(newLocale);
        
        // Store preference
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('locale', newLocale);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [namespace, setLocale]
  );

  return {
    t,
    locale,
    changeLocale,
    isLoading,
  };
}

/**
 * Interpolate values into translation string
 */
function interpolate(template: string, values?: TranslationValues): string {
  if (!values) return template;

  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match;
  });
}

/**
 * Hook for locale information
 */
export function useLocale() {
  const locale = useUIStore((state) => state.locale);
  const setLocale = useUIStore((state) => state.setLocale);

  return {
    locale,
    setLocale,
  };
}
