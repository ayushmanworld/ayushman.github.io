/**
 * @packageDocumentation
 * @module @ayushman/config
 *
 * Shared runtime configuration and constants for the Ayushman platform.
 * This package provides environment-independent configuration values
 * that are shared across the frontend and backend applications.
 */

// ─────────────────────────────────────────────────
// Application Constants
// ─────────────────────────────────────────────────

export const APP_CONFIG = {
  name: 'Ayushman',
  tagline: 'Empowering Abilities. Enriching Lives.',
  description: 'AI-Powered Autism Support Platform',
  url: 'https://ayushman.world',
  apiUrl: 'https://api.ayushman.world',
  supportEmail: 'support@ayushman.world',
  founderPhone: '+91 82800 56665',
  founderEmail: 'ayushmans@outlook.in',
  registeredAddress: 'Bangalore, Karnataka, India',
  section80GNumber: 'Pending',
  panNumber: 'Pending',
} as const

// ─────────────────────────────────────────────────
// Pagination Defaults
// ─────────────────────────────────────────────────

export const PAGINATION = {
  defaultPage: 1,
  defaultLimit: 12,
  maxLimit: 100,
  resourcesLimit: 12,
  videosLimit: 24,
  donationsLimit: 10,
  adminLimit: 20,
} as const

// ─────────────────────────────────────────────────
// Donation Configuration
// ─────────────────────────────────────────────────

export const DONATION_CONFIG = {
  currency: 'INR',
  minAmountINR: 100,
  maxAmountINR: 1_000_000,
  partnerRegistrationFeeINR: 5_000,
  suggestedAmountsINR: [500, 1000, 2500, 5000, 10000, 25000] as const,
} as const

// ─────────────────────────────────────────────────
// Cache TTLs (seconds)
// ─────────────────────────────────────────────────

export const CACHE_TTL = {
  publicStats: 300,        // 5 minutes
  resources: 600,          // 10 minutes
  videos: 3600,            // 1 hour
  partners: 600,           // 10 minutes
  userProfile: 60,         // 1 minute
  aiSession: 86400,        // 24 hours
  donationStats: 300,      // 5 minutes
} as const

// ─────────────────────────────────────────────────
// File Upload Configuration
// ─────────────────────────────────────────────────

export const UPLOAD_CONFIG = {
  maxFileSizeBytes: 10 * 1024 * 1024,  // 10 MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'] as const,
  allowedDocumentTypes: ['application/pdf'] as const,
  s3Prefix: {
    avatars: 'avatars',
    documents: 'documents',
    evidence: 'evidence',
  },
} as const

// ─────────────────────────────────────────────────
// Authentication Configuration
// ─────────────────────────────────────────────────

export const AUTH_CONFIG = {
  accessTokenExpiresIn: '15m',
  refreshTokenExpiresIn: '7d',
  bcryptRounds: 12,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
} as const

// ─────────────────────────────────────────────────
// Rate Limiting
// ─────────────────────────────────────────────────

export const RATE_LIMIT = {
  general: { ttl: 60_000, limit: 100 },
  auth: { ttl: 60_000, limit: 5 },
  ai: { ttl: 60_000, limit: 20 },
  donation: { ttl: 60_000, limit: 10 },
  upload: { ttl: 60_000, limit: 20 },
} as const

// ─────────────────────────────────────────────────
// Indian States (for location selection)
// ─────────────────────────────────────────────────

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
] as const

export type IndianState = (typeof INDIAN_STATES)[number]

// ─────────────────────────────────────────────────
// Diagnosis Display Labels
// ─────────────────────────────────────────────────

export const DIAGNOSIS_LABELS: Record<string, string> = {
  AUTISM: 'Autism Spectrum Disorder (ASD)',
  ADHD: 'ADHD / ADD',
  AUTISM_ADHD: 'Autism + ADHD',
  DEVELOPMENTAL_DELAY: 'Developmental Delay',
  SPEECH_DELAY: 'Speech & Language Delay',
  SENSORY_PROCESSING: 'Sensory Processing Disorder',
  DOWN_SYNDROME: 'Down Syndrome',
  CEREBRAL_PALSY: 'Cerebral Palsy',
  INTELLECTUAL_DISABILITY: 'Intellectual Disability',
  OTHER: 'Other',
  UNDIAGNOSED: 'Not yet diagnosed',
}

// ─────────────────────────────────────────────────
// Resource Type Display Labels
// ─────────────────────────────────────────────────

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  THERAPY: 'Therapy Centre',
  SCHOOL: 'Inclusive / Special School',
  HOSPITAL: 'Hospital / Diagnostic Centre',
  SPORTS: 'Sports Academy',
  GOVT: 'Government Resource',
  PARENT_SUPPORT: 'Parent Support Group',
  RESEARCH: 'Research / Advocacy',
  GLOBAL: 'Global Resource',
}

// ─────────────────────────────────────────────────
// Donation Cause Display Labels
// ─────────────────────────────────────────────────

export const DONATION_CAUSE_LABELS: Record<string, string> = {
  THERAPY: 'Therapy Sessions',
  SCHOOL: 'School Support',
  ENGAGEMENT: 'Engagement Programs',
  FOOD_NUTRITION: 'Food & Nutrition',
  UNIFORMS: 'School Uniforms',
  FAMILY_HELP: 'Family Support',
  GENERAL: 'General Fund (Most Needed)',
}

// ─────────────────────────────────────────────────
// Feature Flags (overridden by env)
// ─────────────────────────────────────────────────

export interface FeatureFlags {
  aiAssistant: boolean
  partnerRegistration: boolean
  donations: boolean
  videoLibrary: boolean
  researchFinder: boolean
  analytics: boolean
}

export const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  aiAssistant: true,
  partnerRegistration: true,
  donations: true,
  videoLibrary: true,
  researchFinder: true,
  analytics: true,
}
