'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard'
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setServerError(null)

    const result = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (result?.error !== undefined && result.error !== null) {
      setServerError('Invalid email or password. Please try again.')
      return
    }

    router.push(callbackUrl)
    router.refresh()
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      {/* Card */}
      <div className="rounded-3xl border border-cream-300 bg-white p-8 shadow-warm-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">👋</div>
          <h1 className="font-serif text-3xl font-bold text-navy">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your Ayushman account
          </p>
        </div>

        {/* Server error */}
        {serverError !== null && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{serverError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email !== undefined}
              {...register('email')}
            />
            {errors.email !== undefined && (
              <p className="text-xs text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-amber-500 hover:text-amber-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password !== undefined}
                className="pr-12"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className={cn(
                  'absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground',
                  'hover:text-navy focus:outline-none',
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden />
                )}
              </button>
            </div>
            {errors.password !== undefined && (
              <p className="text-xs text-destructive" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isSubmitting}
          >
            Sign in →
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-cream-300" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-muted-foreground">
              New to Ayushman?
            </span>
          </div>
        </div>

        {/* Register link */}
        <Link href="/register">
          <Button variant="outline" className="w-full" size="lg">
            Create an account
          </Button>
        </Link>
      </div>

      {/* Help text */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        Having trouble?{' '}
        <a
          href="mailto:support@ayushman.world"
          className="font-medium text-amber-500 hover:underline"
        >
          Contact support
        </a>
      </p>
    </div>
  )
}
