'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'
import { authApi } from '@/lib/auth'
import { getApiErrorMessage } from '@/lib/api-client'
import { cn } from '@/lib/cn'

const schema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (token === null || token === '') {
    return (
      <div className="w-full max-w-md text-center">
        <div className="rounded-3xl border border-cream-300 bg-white p-10 shadow-warm-lg">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" />
          <h2 className="font-serif text-2xl font-bold text-navy">Invalid link</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link href="/forgot-password" className="mt-6 block">
            <Button className="w-full">Request new link</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="w-full max-w-md animate-fade-up text-center">
        <div className="rounded-3xl border border-cream-300 bg-white p-10 shadow-warm-lg">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-teal-500" />
          <h2 className="font-serif text-2xl font-bold text-navy">Password reset!</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Link href="/login" className="mt-6 block">
            <Button className="w-full">Go to login →</Button>
          </Link>
        </div>
      </div>
    )
  }

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      await authApi.resetPassword(token, data.password)
      setSuccess(true)
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="rounded-3xl border border-cream-300 bg-white p-8 shadow-warm-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🔑</div>
          <h1 className="font-serif text-3xl font-bold text-navy">Set new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>

        {serverError !== null && (
          <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                autoComplete="new-password"
                error={errors.password !== undefined}
                className="pr-12"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className={cn('absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy focus:outline-none')}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            {errors.password !== undefined && (
              <p className="text-xs text-destructive" role="alert">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              error={errors.confirmPassword !== undefined}
              {...register('confirmPassword')}
            />
            {errors.confirmPassword !== undefined && (
              <p className="text-xs text-destructive" role="alert">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Reset password →
          </Button>
        </form>
      </div>
    </div>
  )
}
