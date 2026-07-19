/**
 * @packageDocumentation
 * Unit tests for @ayushman/utils
 * Coverage target: 90%
 */

import {
  formatCurrencyINR,
  formatIndianNumber,
  inrToPaise,
  paiseToInr,
  truncate,
  slugify,
  titleCase,
  maskEmail,
  maskPhone,
  isValidIndianPhone,
  isValidEmail,
  isValidPinCode,
  isValidPAN,
  unique,
  groupBy,
  chunk,
  omitNullish,
  pick,
  generateRegistrationId,
  generateReceiptNumber,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
  buildUrl,
  formatDateIndian,
} from './index'

// ─────────────────────────────────────────────────
// Currency Formatting
// ─────────────────────────────────────────────────

describe('formatCurrencyINR', () => {
  it('formats paise to INR with rupee symbol', () => {
    expect(formatCurrencyINR(100000)).toContain('1,000')
    expect(formatCurrencyINR(100000)).toContain('₹')
  })

  it('formats zero correctly', () => {
    expect(formatCurrencyINR(0)).toContain('₹')
    expect(formatCurrencyINR(0)).toContain('0')
  })

  it('formats large amounts with Indian number system', () => {
    const result = formatCurrencyINR(10_000_00) // ₹10,000
    expect(result).toContain('₹')
  })
})

describe('formatIndianNumber', () => {
  it('formats with Indian comma placement', () => {
    expect(formatIndianNumber(100000)).toBe('1,00,000')
    expect(formatIndianNumber(1000)).toBe('1,000')
  })
})

describe('inrToPaise', () => {
  it('converts rupees to paise', () => {
    expect(inrToPaise(100)).toBe(10000)
    expect(inrToPaise(1)).toBe(100)
    expect(inrToPaise(0)).toBe(0)
  })

  it('rounds fractional amounts', () => {
    expect(inrToPaise(1.005)).toBe(101)
  })
})

describe('paiseToInr', () => {
  it('converts paise to rupees', () => {
    expect(paiseToInr(10000)).toBe(100)
    expect(paiseToInr(100)).toBe(1)
    expect(paiseToInr(0)).toBe(0)
  })
})

// ─────────────────────────────────────────────────
// String Utilities
// ─────────────────────────────────────────────────

describe('truncate', () => {
  it('returns string as-is if within limit', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates and adds ellipsis', () => {
    expect(truncate('hello world', 8)).toBe('hello...')
    expect(truncate('hello world', 8)).toHaveLength(8)
  })

  it('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello')
  })
})

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
  })

  it('converts to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('removes special characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('hello  world')).toBe('hello-world')
  })
})

describe('titleCase', () => {
  it('capitalises first letter of each word', () => {
    expect(titleCase('hello world')).toBe('Hello World')
    expect(titleCase('autism spectrum disorder')).toBe('Autism Spectrum Disorder')
  })
})

describe('maskEmail', () => {
  it('masks middle of local part', () => {
    expect(maskEmail('john@gmail.com')).toBe('jo***@gmail.com')
  })

  it('handles short email local parts', () => {
    expect(maskEmail('a@b.com')).toBe('a***@b.com')
  })

  it('returns original if invalid format', () => {
    expect(maskEmail('notanemail')).toBe('notanemail')
  })
})

describe('maskPhone', () => {
  it('masks middle digits', () => {
    const result = maskPhone('+91 82800 56665')
    expect(result).toContain('6665')
    expect(result).toContain('****')
  })
})

// ─────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────

describe('isValidIndianPhone', () => {
  it('validates correct Indian mobile numbers', () => {
    expect(isValidIndianPhone('9876543210')).toBe(true)
    expect(isValidIndianPhone('+91 9876543210')).toBe(true)
    expect(isValidIndianPhone('8280056665')).toBe(true)
  })

  it('rejects invalid numbers', () => {
    expect(isValidIndianPhone('1234567890')).toBe(false) // starts with 1
    expect(isValidIndianPhone('98765')).toBe(false)      // too short
    expect(isValidIndianPhone('abcdefghij')).toBe(false)
  })
})

describe('isValidEmail', () => {
  it('validates correct email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('user.name+tag@domain.co.in')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('notanemail')).toBe(false)
    expect(isValidEmail('@domain.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
  })
})

describe('isValidPinCode', () => {
  it('validates 6-digit PIN codes', () => {
    expect(isValidPinCode('560076')).toBe(true)
    expect(isValidPinCode('110001')).toBe(true)
  })

  it('rejects invalid PIN codes', () => {
    expect(isValidPinCode('12345')).toBe(false)  // 5 digits
    expect(isValidPinCode('1234567')).toBe(false) // 7 digits
    expect(isValidPinCode('ABCDEF')).toBe(false)
  })
})

describe('isValidPAN', () => {
  it('validates correct PAN numbers', () => {
    expect(isValidPAN('ABCDE1234F')).toBe(true)
    expect(isValidPAN('abcde1234f')).toBe(true) // lowercase should be accepted
  })

  it('rejects invalid PAN numbers', () => {
    expect(isValidPAN('ABCD1234F')).toBe(false)  // too short
    expect(isValidPAN('12345ABCDE')).toBe(false) // starts with digits
  })
})

// ─────────────────────────────────────────────────
// Array Utilities
// ─────────────────────────────────────────────────

describe('unique', () => {
  it('removes duplicate values', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b'])
  })

  it('handles empty arrays', () => {
    expect(unique([])).toEqual([])
  })
})

describe('groupBy', () => {
  const items = [
    { type: 'therapy', name: 'NIMHANS' },
    { type: 'school', name: 'Tamana' },
    { type: 'therapy', name: 'AACT' },
  ]

  it('groups items by a key', () => {
    const result = groupBy(items, 'type')
    expect(result['therapy']).toHaveLength(2)
    expect(result['school']).toHaveLength(1)
  })
})

describe('chunk', () => {
  it('splits array into chunks of given size', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]])
  })

  it('handles empty arrays', () => {
    expect(chunk([], 3)).toEqual([])
  })
})

// ─────────────────────────────────────────────────
// Object Utilities
// ─────────────────────────────────────────────────

describe('omitNullish', () => {
  it('removes null and undefined values', () => {
    const result = omitNullish({ a: 1, b: null, c: undefined, d: 0, e: '' })
    expect(result).toEqual({ a: 1, d: 0, e: '' })
    expect('b' in result).toBe(false)
    expect('c' in result).toBe(false)
  })
})

describe('pick', () => {
  it('picks specified keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    expect(pick(obj, ['a', 'c'])).toEqual({ a: 1, c: 3 })
  })

  it('ignores non-existent keys', () => {
    const obj = { a: 1 }
    // @ts-expect-error — testing runtime behaviour
    expect(pick(obj, ['a', 'z'])).toEqual({ a: 1 })
  })
})

// ─────────────────────────────────────────────────
// ID Generation
// ─────────────────────────────────────────────────

describe('generateRegistrationId', () => {
  it('matches REG-YYYY-XXXXX format', () => {
    const id = generateRegistrationId()
    expect(id).toMatch(/^REG-\d{4}-\d{5}$/)
  })

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRegistrationId()))
    expect(ids.size).toBeGreaterThan(90) // allow some collision probability
  })
})

describe('generateReceiptNumber', () => {
  it('matches AYU-YYYY-XXXXX format', () => {
    const num = generateReceiptNumber()
    expect(num).toMatch(/^AYU-\d{4}-\d{5}$/)
  })
})

// ─────────────────────────────────────────────────
// URL Utilities
// ─────────────────────────────────────────────────

describe('getYouTubeThumbnail', () => {
  it('builds correct thumbnail URL', () => {
    const url = getYouTubeThumbnail('Oo4f-eDkzIM')
    expect(url).toBe('https://img.youtube.com/vi/Oo4f-eDkzIM/hqdefault.jpg')
  })

  it('uses specified quality', () => {
    const url = getYouTubeThumbnail('Oo4f-eDkzIM', 'maxres')
    expect(url).toContain('maxresdefault.jpg')
  })
})

describe('getYouTubeEmbedUrl', () => {
  it('builds correct embed URL', () => {
    const url = getYouTubeEmbedUrl('Oo4f-eDkzIM')
    expect(url).toContain('youtube.com/embed/Oo4f-eDkzIM')
    expect(url).toContain('autoplay=1')
  })
})

describe('buildUrl', () => {
  it('appends query parameters', () => {
    const url = buildUrl('https://example.com', { city: 'bangalore', type: 'therapy' })
    expect(url).toContain('city=bangalore')
    expect(url).toContain('type=therapy')
  })

  it('omits undefined values', () => {
    const url = buildUrl('https://example.com', { city: 'bangalore', type: undefined })
    expect(url).toContain('city=bangalore')
    expect(url).not.toContain('type')
  })

  it('omits empty string values', () => {
    const url = buildUrl('https://example.com', { city: '', type: 'therapy' })
    expect(url).not.toContain('city=')
    expect(url).toContain('type=therapy')
  })
})

describe('formatDateIndian', () => {
  it('formats a date in Indian locale', () => {
    const result = formatDateIndian('2026-07-04T00:00:00Z')
    expect(result).toContain('2026')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(5)
  })
})
