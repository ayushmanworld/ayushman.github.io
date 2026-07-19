'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z
    .string()
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a valid Indian mobile number')
    .optional()
    .or(z.literal('')),
  role: z.enum(['PARENT', 'DONOR', 'PARTNER', 'THERAPIST', 'EDUCATOR', 'VOLUNTEER']),
})

type RegisterForm = z.infer<typeof registerSchema>

const ROLE_OPTIONS = [
  { value: 'PARENT', label: '👨‍👩‍👧 Parent / Guardian', desc: 'I have a child with autism or ADHD' },
  { value: 'DONOR', label: '💛 Supporter / Donor', desc: 'I want to support children in need' },
  { value: 'THERAPIST', label: '🧠 Therapist', desc: 'I provide therapy services' },
  { value: 'EDUCATOR', label: '🏫 Educator', desc: 'I work in a school or educational setting' },
  { value: 'PARTNER', label: '🤝 Service Provider', desc: 'I run a therapy centre or school' },
  { value: 'VOLUNTEER', label: '🌱 Volunteer', desc: 'I want to volunteer my time' },
] as const

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'PARENT' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterForm) => {
    setServerError(null)
    try {
      await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone ?? undefined,
        role: data.role,
      })

      setSuccess(true)

      // Auto sign-in after registration
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md animate-fade-up text-center">
        <div className="rounded-3xl border border-cream-300 bg-white p-10 shadow-warm-lg">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-teal-500" />
          <h2 className="font-serif text-2xl font-bold text-navy">Welcome to Ayushman!</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account has been created. We've sent a verification email — please check your inbox.
            Redirecting you to your dashboard…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl animate-fade-up py-8">
      <div className="rounded-3xl border border-cream-300 bg-white p-8 shadow-warm-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">✨</div>
          <h1 className="font-serif text-3xl font-bold text-navy">Join Ayushman</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create a free account to access resources, connect with families, and get AI-powered support.
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

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Role selection */}
          <div className="space-y-2">
            <Label>I am a…</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setValue('role', option.value)}
                  className={cn(
                    'flex flex-col items-start rounded-xl border-2 p-3 text-left transition-all duration-150',
                    selectedRole === option.value
                      ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                      : 'border-cream-300 bg-cream-100 hover:border-amber-200',
                  )}
                >
                  <span className="text-sm font-semibold text-navy">{option.label}</span>
                  <span className="mt-0.5 text-xs text-muted-foreground">{option.desc}</span>
                </button>
              ))}
            </div>
            {errors.role !== undefined && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Priya Sharma"
              autoComplete="name"
              error={errors.name !== undefined}
              {...register('name')}
            />
            {errors.name !== undefined && (
              <p className="text-xs text-destructive" role="alert">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email !== undefined}
              {...register('email')}
            />
            {errors.email !== undefined && (
              <p className="text-xs text-destructive" role="alert">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone">
              Mobile number{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 98765 43210"
              autoComplete="tel"
              error={errors.phone !== undefined}
              {...register('phone')}
            />
            {errors.phone !== undefined && (
              <p className="text-xs text-destructive" role="alert">{errors.phone.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password *</Label>
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy focus:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              </button>
            </div>
            {errors.password !== undefined && (
              <p className="text-xs text-destructive" role="alert">{errors.password.message}</p>
            )}
          </div>

          {/* Terms */}
          <p className="text-xs text-muted-foreground">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="text-amber-500 hover:underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-amber-500 hover:underline">Privacy Policy</Link>.
          </p>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Create account →
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-cream-300" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-4 text-muted-foreground">Already have an account?</span>
          </div>
        </div>

        <Link href="/login">
          <Button variant="outline" className="w-full" size="lg">
            Sign in
          </Button>
        </Link>
      </div>
    </div>
  )
}
