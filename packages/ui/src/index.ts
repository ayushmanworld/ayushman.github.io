/**
 * @packageDocumentation
 * @module @ayushman/ui
 *
 * Shared UI component primitives for the Ayushman platform.
 * Built on top of shadcn/ui and Radix UI primitives.
 * Consumed by apps/web and apps/admin.
 */

// Re-export all shared primitive components
// Components are added here as they are implemented in Phase 2.
// This barrel file exists to establish the package boundary.

export { cn } from './lib/cn'
export type { ClassValue } from 'clsx'
