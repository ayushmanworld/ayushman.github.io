'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { authApi } from '@/lib/auth'
import { getApiErrorMessage } from '@/lib/api-client'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch (error) {
      setServerError(getApiErrorMessage(error))
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-md animate-fade-up text-center">
        <div className="rounded-3xl border border-cream-300 bg-white p-10 shadow-warm-lg">
          <CheckCircle className="mx-auto mb-4 h-16 w-16 text-teal-500" aria-hidden />
          <h2 className="font-serif text-2xl font-bold text-navy">Check your email</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            If an account exists for{' '}
            <strong className="text-navy">{getValues('email')}</strong>, we've sent a password
            reset link. Check your inbox and spam folder.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">The link expires in 1 hour.</p>
          <Link href="/login" className="mt-6 block">
            <Button variant="outline" className="w-full">
              Back to login
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div className="rounded-3xl border border-cream-300 bg-white p-8 shadow-warm-lg">
        <div className="mb-8 text-center">
          <div className="mb-4 text-4xl">🔐</div>
          <h1 className="font-serif text-3xl font-bold text-navy">Forgot password?</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No worries. Enter your email and we'll send you a reset link.
          </p>
        </div>

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
              <p className="text-xs text-destructive" role="alert">{errors.email.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Send reset link →
          </Button>
        </form>

        <Link
          href="/login"
          className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-amber-500"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to login
        </Link>
      </div>
    </div>
  )
}
