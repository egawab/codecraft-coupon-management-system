// Static imports for all translations to ensure they're bundled properly
import enTranslations from './en.json';
import arTranslations from './ar.json';

export const translations = {
  en: enTranslations,
  ar: arTranslations
};

export type Language = 'en' | 'ar';
export type Translations = Record<string, any>;