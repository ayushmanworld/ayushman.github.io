'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { authApi } from '@/lib/auth'
import { getApiErrorMessage } from '@/lib/api-client'

type State = 'loading' | 'success' | 'error' | 'missing'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [state, setState] = useState<State>(token === null ? 'missing' : 'loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    if (token === null) {
      setState('missing')
      return
    }

    async function verify() {
      try {
        await authApi.verifyEmail(token!)
        setState('success')
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error))
        setState('error')
      }
    }

    void verify()
  }, [token])

  return (
    <div className="w-full max-w-md animate-fade-up text-center">
      <div className="rounded-3xl border border-cream-300 bg-white p-10 shadow-warm-lg">
        {state === 'loading' && (
          <>
            <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-amber-500" aria-label="Verifying" />
            <h2 className="font-serif text-2xl font-bold text-navy">Verifying your email…</h2>
            <p className="mt-3 text-sm text-muted-foreground">Please wait a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-teal-500" aria-hidden />
            <h2 className="font-serif text-2xl font-bold text-navy">Email verified! 🎉</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Your email address has been verified. Your account is now fully active.
            </p>
            <Link href="/dashboard" className="mt-6 block">
              <Button className="w-full">Go to dashboard →</Button>
            </Link>
          </>
        )}

        {(state === 'error' || state === 'missing') && (
          <>
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-destructive" aria-hidden />
            <h2 className="font-serif text-2xl font-bold text-navy">
              {state === 'missing' ? 'Invalid link' : 'Verification failed'}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              {state === 'missing'
                ? 'This verification link is invalid. Please check your email for the correct link.'
                : errorMessage}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link href="/login">
                <Button className="w-full">Sign in to resend</Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="w-full">Go to homepage</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
