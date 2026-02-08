/**
 * i18n type definitions
 */

/**
 * Translation key type
 */
export type TranslationKey = string;

/**
 * Translation values (for interpolation)
 */
export type TranslationValues = Record<string, string | number>;

/**
 * Translation function
 */
export type TranslateFunction = (
  key: TranslationKey,
  values?: TranslationValues,
  options?: { ns?: string; defaultValue?: string }
) => string;

/**
 * Locale change listener
 */
export type LocaleChangeListener = (locale: string) => void;

/**
 * i18n Service interface
 */
export interface I18nService {
  currentLocale: string;
  t: TranslateFunction;
  changeLocale: (locale: string) => Promise<void>;
  addTranslations: (locale: string, namespace: string, translations: any) => void;
  onLocaleChange: (listener: LocaleChangeListener) => () => void;
}

/**
 * Translation resources structure
 */
export interface TranslationResources {
  [locale: string]: {
    [namespace: string]: {
      [key: string]: string | TranslationResources[string][string];
    };
  };
}

/**
 * Number format options
 */
export interface NumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent';
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Date format options
 */
export interface DateFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  format?: string;
}
