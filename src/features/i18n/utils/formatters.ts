/**
 * Locale-aware formatters
 */

import type { NumberFormatOptions, DateFormatOptions } from '../types/i18n.types';

/**
 * Format number according to locale
 */
export function formatNumber(
  value: number,
  locale: string,
  options: NumberFormatOptions = {}
): string {
  const formatter = new Intl.NumberFormat(locale, options);
  return formatter.format(value);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  value: number,
  locale: string,
  currency: string = 'USD'
): string {
  return formatNumber(value, locale, {
    style: 'currency',
    currency,
  });
}

/**
 * Format percentage according to locale
 */
export function formatPercent(value: number, locale: string): string {
  return formatNumber(value / 100, locale, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string,
  locale: string,
  options: DateFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: options.dateStyle || 'medium',
    timeStyle: options.timeStyle,
  });
  
  return formatter.format(dateObj);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Use Intl.RelativeTimeFormat if available
  if ('RelativeTimeFormat' in Intl) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second');
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    } else if (diffInSeconds < 604800) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
    }
  }

  // Fallback for older browsers
  return formatDate(dateObj, locale);
}

/**
 * Format list according to locale
 */
export function formatList(
  items: string[],
  locale: string,
  type: 'conjunction' | 'disjunction' = 'conjunction'
): string {
  if ('ListFormat' in Intl) {
    const formatter = new Intl.ListFormat(locale, { type });
    return formatter.format(items);
  }

  // Fallback
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) {
    return `${items[0]} ${type === 'conjunction' ? 'and' : 'or'} ${items[1]}`;
  }

  const last = items[items.length - 1];
  const rest = items.slice(0, -1).join(', ');
  return `${rest}, ${type === 'conjunction' ? 'and' : 'or'} ${last}`;
}

/**
 * Get currency symbol for locale
 */
export function getCurrencySymbol(currency: string, locale: string): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const parts = formatter.formatToParts(0);
  const symbolPart = parts.find((part) => part.type === 'currency');
  
  return symbolPart?.value || currency;
}

/**
 * Pluralize based on count and locale
 */
export function pluralize(
  count: number,
  singular: string,
  plural: string,
  locale: string = 'en'
): string {
  if ('PluralRules' in Intl) {
    const pr = new Intl.PluralRules(locale);
    const rule = pr.select(count);
    
    return rule === 'one' ? singular : plural;
  }

  // Simple fallback
  return count === 1 ? singular : plural;
}
