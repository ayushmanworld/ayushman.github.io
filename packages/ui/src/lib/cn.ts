import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with conflict resolution.
 * Combines clsx for conditional classes and tailwind-merge for deduplication.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-amber', 'px-6') // → 'py-2 bg-amber px-6'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
