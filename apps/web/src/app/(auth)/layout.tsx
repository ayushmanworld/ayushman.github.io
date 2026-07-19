import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    template: '%s | Ayushman',
    default: 'Ayushman',
  },
}

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cream-100">
      {/* Minimal nav */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-cream-300 bg-warm-white/95 px-6 backdrop-blur-sm">
        <Link
          href="/"
          className="font-serif text-xl font-bold text-amber-500 transition-opacity hover:opacity-80"
        >
          Ayushman
        </Link>
        <p className="hidden text-xs font-semibold uppercase tracking-widest text-amber-500 sm:block">
          Empowering Abilities. Enriching Lives.
        </p>
      </div>

      {/* Page content */}
      <div className="flex min-h-screen flex-col items-center justify-center px-4 pt-16">
        {children}
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>
          © 2026 Ayushman ·{' '}
          <Link href="/privacy" className="hover:text-amber-500">
            Privacy Policy
          </Link>{' '}
          ·{' '}
          <Link href="/terms" className="hover:text-amber-500">
            Terms
          </Link>
        </p>
      </footer>
    </div>
  )
}
