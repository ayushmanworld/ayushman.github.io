'use client'

import * as React from 'react'
import { cn } from '@/lib/cn'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-xl border bg-cream-100 px-4 py-2 text-sm text-navy ring-offset-background',
          'placeholder:text-muted-foreground',
          'transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error === true
            ? 'border-destructive focus-visible:ring-destructive'
            : 'border-cream-300 focus-visible:border-amber-500',
          className,
        )}
        ref={ref}
        aria-invalid={error === true}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
