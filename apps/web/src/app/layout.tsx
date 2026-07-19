import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://ayushman.world'),
  title: {
    default: 'Ayushman — Empowering Abilities. Enriching Lives.',
    template: '%s | Ayushman',
  },
  description:
    'India\'s most comprehensive AI-powered Autism Support Platform. Find therapy centres, inclusive schools, research resources and government schemes.',
  keywords: [
    'autism',
    'ADHD',
    'special needs',
    'NGO India',
    'therapy',
    'inclusive education',
    'autism support',
    'Bangalore',
    'India',
  ],
  authors: [{ name: 'Ayushman NGO', url: 'https://ayushman.world' }],
  creator: 'Ayushman NGO',
  publisher: 'Ayushman NGO',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://ayushman.world',
    siteName: 'Ayushman',
    title: 'Ayushman — Empowering Abilities. Enriching Lives.',
    description:
      'AI-powered Autism Support Platform connecting families with therapy, schools, and government schemes across India.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Ayushman NGO' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayushman — AI-Powered Autism Support',
    description: 'Empowering Abilities. Enriching Lives.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#C8782A' },
    { media: '(prefers-color-scheme: dark)', color: '#1E2D3D' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
