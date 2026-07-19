/**
 * @packageDocumentation
 * @module @ayushman/utils
 *
 * Shared utility functions for the Ayushman platform.
 * Pure functions only — no side effects, no external dependencies.
 */

// ─────────────────────────────────────────────────
// Currency Formatting
// ─────────────────────────────────────────────────

/**
 * Format an amount in paise to a human-readable INR string.
 * @param paise - Amount in paise (₹1 = 100 paise)
 * @returns Formatted string like "₹1,500"
 */
export function formatCurrencyINR(paise: number): string {
  const rupees = paise / 100
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupees)
}

/**
 * Format a number with Indian number system (lakhs, crores).
 * @param num - The number to format
 * @returns Formatted string like "1,00,000"
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Convert INR amount to paise.
 */
export function inrToPaise(inr: number): number {
  return Math.round(inr * 100)
}

/**
 * Convert paise to INR.
 */
export function paiseToInr(paise: number): number {
  return paise / 100
}

// ─────────────────────────────────────────────────
// Date Formatting
// ─────────────────────────────────────────────────

/**
 * Format a date in Indian locale format.
 * @param date - Date string or Date object
 * @returns Formatted string like "15 July 2026"
 */
export function formatDateIndian(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Format a datetime in Indian locale.
 */
export function formatDateTimeIndian(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Get relative time string (e.g., "2 hours ago").
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diffMs = d.getTime() - Date.now()
  const diffMins = Math.round(diffMs / 60_000)
  const diffHours = Math.round(diffMs / 3_600_000)
  const diffDays = Math.round(diffMs / 86_400_000)

  if (Math.abs(diffMins) < 60) {
    return rtf.format(diffMins, 'minute')
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, 'hour')
  }
  return rtf.format(diffDays, 'day')
}

// ─────────────────────────────────────────────────
// String Utilities
// ─────────────────────────────────────────────────

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str
  }
  return `${str.slice(0, maxLength - 3)}...`
}

/**
 * Convert a string to a URL-safe slug.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

/**
 * Capitalize the first letter of each word.
 */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (word) => {
    const first = word.charAt(0)
    return (first !== undefined ? first.toUpperCase() : '') + word.slice(1).toLowerCase()
  })
}

/**
 * Mask an email address for display (e.g., "j***@gmail.com").
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) {
    return email
  }
  const visibleChars = Math.min(2, local.length)
  return `${local.slice(0, visibleChars)}***@${domain}`
}

/**
 * Mask a phone number (e.g., "+91 ****56665").
 */
export function maskPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '')
  const lastFour = cleaned.slice(-4)
  const prefix = cleaned.slice(0, cleaned.length > 10 ? cleaned.length - 10 : 0)
  return `${prefix}****${lastFour}`
}

// ─────────────────────────────────────────────────
// Validation Utilities
// ─────────────────────────────────────────────────

/**
 * Validate an Indian mobile number.
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-+]/g, '')
  return /^(\+91)?[6-9]\d{9}$/.test(cleaned)
}

/**
 * Validate an email address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Validate an Indian PIN code.
 */
export function isValidPinCode(pin: string): boolean {
  return /^\d{6}$/.test(pin)
}

/**
 * Validate a PAN number (for 80G receipts).
 */
export function isValidPAN(pan: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan.toUpperCase())
}

// ─────────────────────────────────────────────────
// Array Utilities
// ─────────────────────────────────────────────────

/**
 * Remove duplicate values from an array.
 */
export function unique<T>(arr: readonly T[]): T[] {
  return [...new Set(arr)]
}

/**
 * Group an array of objects by a key.
 */
export function groupBy<T>(
  arr: readonly T[],
  key: keyof T,
): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const groupKey = String(item[key])
      const existing = groups[groupKey]
      if (existing) {
        existing.push(item)
      } else {
        groups[groupKey] = [item]
      }
      return groups
    },
    {} as Record<string, T[]>,
  )
}

/**
 * Chunk an array into groups of a given size.
 */
export function chunk<T>(arr: readonly T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push([...arr.slice(i, i + size)])
  }
  return chunks
}

// ─────────────────────────────────────────────────
// Object Utilities
// ─────────────────────────────────────────────────

/**
 * Remove undefined and null values from an object.
 */
export function omitNullish<T extends Record<string, unknown>>(
  obj: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== null && v !== undefined),
  ) as Partial<T>
}

/**
 * Pick specific keys from an object.
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key]
    }
  }
  return result
}

// ─────────────────────────────────────────────────
// ID Generation
// ─────────────────────────────────────────────────

/**
 * Generate a registration ID in the format REG-YYYY-XXXXX.
 */
export function generateRegistrationId(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10_000 + Math.random() * 90_000)
  return `REG-${year}-${random}`
}

/**
 * Generate a receipt number in the format AYU-YYYY-XXXXX.
 */
export function generateReceiptNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(10_000 + Math.random() * 90_000)
  return `AYU-${year}-${random}`
}

// ─────────────────────────────────────────────────
// URL Utilities
// ─────────────────────────────────────────────────

/**
 * Build a YouTube thumbnail URL from a video ID.
 */
export function getYouTubeThumbnail(
  videoId: string,
  quality: 'default' | 'hq' | 'mq' | 'sd' | 'maxres' = 'hq',
): string {
  const qualityMap = {
    default: 'default',
    hq: 'hqdefault',
    mq: 'mqdefault',
    sd: 'sddefault',
    maxres: 'maxresdefault',
  }
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`
}

/**
 * Build a YouTube embed URL from a video ID.
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`
}

/**
 * Safely append query parameters to a URL.
 */
export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | undefined>,
): string {
  const url = new URL(base)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}
