import type { Metadata } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/toaster'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Ayushman — Empowering Abilities. Enriching Lives.',
    template: '%s | Ayushman NGO',
  },
  description:
    'An NGO for special-abled children with Autism and ADHD. Find therapy centres, inclusive schools, research, and donate to support children in need.',
  keywords: ['autism', 'ADHD', 'special needs', 'NGO India', 'therapy', 'inclusive education'],
  authors: [{ name: 'Ayushman NGO', url: 'https://ayushman.world' }],
  openGraph: {
    title: 'Ayushman — Empowering Abilities. Enriching Lives.',
    description: 'Supporting families of special-abled children across India.',
    url: 'https://ayushman.world',
    siteName: 'Ayushman',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayushman NGO',
    description: 'Empowering Abilities. Enriching Lives.',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="font-sans bg-warm-white text-navy antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
