/**
 * @packageDocumentation
 * @module @ayushman/types
 *
 * Shared TypeScript type definitions for the Ayushman platform.
 * These types are shared between the frontend, backend, and other packages.
 * All domain types are defined here to ensure consistency across the platform.
 */

// ─────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  readonly success: boolean
  readonly data: T
  readonly message?: string
  readonly timestamp: string
}

export interface PaginatedResponse<T = unknown> {
  readonly items: readonly T[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly totalPages: number
  readonly hasNextPage: boolean
  readonly hasPreviousPage: boolean
}

export interface ApiError {
  readonly success: false
  readonly error: {
    readonly code: string
    readonly message: string
    readonly details?: Record<string, unknown>
  }
  readonly timestamp: string
}

// ─────────────────────────────────────────────────
// Authentication Types
// ─────────────────────────────────────────────────

export type UserRole = 'DONOR' | 'PARENT' | 'PARTNER' | 'ADMIN' | 'FOUNDER'

export interface AuthUser {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly role: UserRole
  readonly isVerified: boolean
  readonly avatarUrl?: string
}

export interface TokenPair {
  readonly accessToken: string
  readonly refreshToken: string
  readonly expiresIn: number
}

export interface AuthSession {
  readonly user: AuthUser
  readonly accessToken: string
  readonly expiresAt: string
}

// ─────────────────────────────────────────────────
// Domain Types — User
// ─────────────────────────────────────────────────

export interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly phone?: string
  readonly role: UserRole
  readonly isVerified: boolean
  readonly isActive: boolean
  readonly avatarUrl?: string
  readonly country?: string
  readonly state?: string
  readonly city?: string
  readonly language: 'en' | 'hi'
  readonly newsletterOptIn: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

// ─────────────────────────────────────────────────
// Domain Types — Child
// ─────────────────────────────────────────────────

export type DiagnosisType =
  | 'AUTISM'
  | 'ADHD'
  | 'AUTISM_ADHD'
  | 'DEVELOPMENTAL_DELAY'
  | 'SPEECH_DELAY'
  | 'SENSORY_PROCESSING'
  | 'DOWN_SYNDROME'
  | 'CEREBRAL_PALSY'
  | 'INTELLECTUAL_DISABILITY'
  | 'OTHER'
  | 'UNDIAGNOSED'

export type AgeGroup =
  | 'INFANT_0_3'
  | 'PRESCHOOL_3_6'
  | 'SCHOOL_6_12'
  | 'ADOLESCENT_12_18'
  | 'ADULT_18_PLUS'

export interface Child {
  readonly id: string
  readonly parentId: string
  readonly name: string
  readonly dateOfBirth?: string
  readonly ageGroup: AgeGroup
  readonly diagnosis: readonly DiagnosisType[]
  readonly diagnosisNotes?: string
  readonly isVerbal?: boolean
  readonly schoolStatus?: string
  readonly therapyStatus: readonly string[]
  readonly city?: string
  readonly state?: string
  readonly createdAt: string
  readonly updatedAt: string
}

// ─────────────────────────────────────────────────
// Domain Types — Donation
// ─────────────────────────────────────────────────

export type DonationStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export type DonationCause =
  | 'THERAPY'
  | 'SCHOOL'
  | 'ENGAGEMENT'
  | 'FOOD_NUTRITION'
  | 'UNIFORMS'
  | 'FAMILY_HELP'
  | 'GENERAL'

export interface Donation {
  readonly id: string
  readonly donorName: string
  readonly donorEmail: string
  readonly amount: number
  readonly currency: string
  readonly cause: DonationCause
  readonly status: DonationStatus
  readonly country?: string
  readonly state?: string
  readonly city?: string
  readonly receiptNumber?: string
  readonly isAnonymous: boolean
  readonly message?: string
  readonly createdAt: string
}

export interface CreateDonationOrderRequest {
  readonly amount: number
  readonly cause: DonationCause
  readonly donorName: string
  readonly donorEmail: string
  readonly donorPhone?: string
  readonly country: string
  readonly state?: string
  readonly city?: string
  readonly message?: string
  readonly isAnonymous?: boolean
}

export interface DonationOrder {
  readonly orderId: string
  readonly amount: number
  readonly currency: string
  readonly donationId: string
  readonly keyId: string
}

export interface VerifyPaymentRequest {
  readonly orderId: string
  readonly paymentId: string
  readonly signature: string
  readonly donationId: string
}

// ─────────────────────────────────────────────────
// Domain Types — Resource
// ─────────────────────────────────────────────────

export type ResourceType =
  | 'THERAPY'
  | 'SCHOOL'
  | 'HOSPITAL'
  | 'SPORTS'
  | 'GOVT'
  | 'PARENT_SUPPORT'
  | 'RESEARCH'
  | 'GLOBAL'

export interface Resource {
  readonly id: string
  readonly name: string
  readonly type: ResourceType
  readonly description: string
  readonly tags: readonly string[]
  readonly address?: string
  readonly city?: string
  readonly state?: string
  readonly country: string
  readonly pinCode?: string
  readonly lat?: number
  readonly lng?: number
  readonly googleMapsUrl?: string
  readonly phone?: string
  readonly whatsapp?: string
  readonly email?: string
  readonly website?: string
  readonly workingHours?: string
  readonly ageGroups?: string
  readonly conditions: readonly string[]
  readonly services: readonly string[]
  readonly feeSession?: number
  readonly feeMonthly?: number
  readonly isVerified: boolean
  readonly createdAt: string
}

export interface ResourceSearchParams {
  readonly query?: string
  readonly type?: ResourceType
  readonly city?: string
  readonly state?: string
  readonly age?: string
  readonly diagnosis?: string
  readonly page?: number
  readonly limit?: number
}

// ─────────────────────────────────────────────────
// Domain Types — Partner
// ─────────────────────────────────────────────────

export type PartnerStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'

export interface Partner {
  readonly id: string
  readonly registrationId: string
  readonly orgName: string
  readonly orgType: string
  readonly description: string
  readonly city: string
  readonly state: string
  readonly phone: string
  readonly email: string
  readonly website?: string
  readonly services: readonly string[]
  readonly workingHours?: string
  readonly lat?: number
  readonly lng?: number
  readonly status: PartnerStatus
  readonly isVisible: boolean
  readonly createdAt: string
}

// ─────────────────────────────────────────────────
// Domain Types — Video
// ─────────────────────────────────────────────────

export interface Video {
  readonly id: number
  readonly title: string
  readonly description?: string
  readonly youtubeId: string
  readonly thumbnailUrl?: string
  readonly duration?: string
  readonly category: string
  readonly language: string
  readonly ageGroup?: string
  readonly isIndiaSpecific: boolean
  readonly isVerified: boolean
  readonly source?: string
  readonly tags: readonly string[]
  readonly viewCount: number
  readonly createdAt: string
}

export interface VideoSearchParams {
  readonly query?: string
  readonly category?: string
  readonly language?: string
  readonly ageGroup?: string
  readonly isIndiaSpecific?: boolean
  readonly page?: number
  readonly limit?: number
}

// ─────────────────────────────────────────────────
// Domain Types — AI
// ─────────────────────────────────────────────────

export interface AiQueryRequest {
  readonly query: string
  readonly childAge?: string
  readonly diagnosis?: string
  readonly city?: string
  readonly language?: 'en' | 'hi'
  readonly sessionId?: string
}

export interface AiQueryResponse {
  readonly answer: string
  readonly sources: readonly AiSource[]
  readonly sessionId: string
  readonly tokensUsed: number
}

export interface AiSource {
  readonly name: string
  readonly url?: string
  readonly type: 'resource' | 'knowledge' | 'external'
}

// ─────────────────────────────────────────────────
// Domain Types — Analytics
// ─────────────────────────────────────────────────

export interface PublicStats {
  readonly totalDonations: number
  readonly totalDonors: number
  readonly totalChildren: number
  readonly totalFamilies: number
  readonly totalResources: number
  readonly totalVideos: number
  readonly countriesReached: number
  readonly donationsByCountry: readonly CountryStat[]
}

export interface CountryStat {
  readonly country: string
  readonly count: number
  readonly amount: number
}

// ─────────────────────────────────────────────────
// Utility Types
// ─────────────────────────────────────────────────

export type Nullable<T> = T | null
export type Optional<T> = T | undefined
export type Maybe<T> = T | null | undefined
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? ReadonlyArray<DeepReadonly<U>>
    : T[P] extends object
      ? DeepReadonly<T[P]>
      : T[P]
}

export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U

export interface SelectOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

export interface DateRange {
  readonly from: string
  readonly to: string
}
