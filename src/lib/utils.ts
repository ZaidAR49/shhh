import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely, resolving conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string to a locale-aware display. */
export function formatDate(isoString: string, locale: string = 'en'): string {
  try {
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(isoString));
  } catch {
    return isoString;
  }
}

/** Format "time ago" relative label. */
export function timeAgo(isoString: string, locale: string = 'en'): string {
  const date = new Date(isoString);
  const now = new Date();
  let diffMs = now.getTime() - date.getTime();
  
  // Prevent "tomorrow" / future dates if server clock is slightly ahead of client
  if (diffMs < 0) diffMs = 0;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : 'en', { numeric: 'auto' });

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return rtf.format(-diffMins, 'minute');
    }
    return rtf.format(-diffHours, 'hour');
  }
  if (diffDays < 30) return rtf.format(-diffDays, 'day');
  if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), 'month');
  return rtf.format(-Math.floor(diffDays / 365), 'year');
}

/** Generate a UUID-like fake ID for new mock records. */
export function generateMockId(prefix: string = 'sec'): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${rand}_${Date.now()}`;
}

/** Mask a string value showing only the last N chars. */
export function maskValue(value: string, visibleChars: number = 4): string {
  if (!value) return '••••••••';
  if (value.length <= visibleChars) return '•'.repeat(value.length);
  return '•'.repeat(Math.min(value.length - visibleChars, 12)) + value.slice(-visibleChars);
}

/** Decode fake encrypted_blob back to fields object. */
export function decodeBlob(blob: string): Record<string, string> {
  try {
    const decoded =
      typeof atob !== 'undefined'
        ? atob(blob)
        : Buffer.from(blob, 'base64').toString('utf-8');
    return JSON.parse(decoded) as Record<string, string>;
  } catch {
    return {};
  }
}
