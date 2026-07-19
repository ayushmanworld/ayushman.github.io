import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  output: 'standalone',

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: 'r2.ayushman.world' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://checkout.razorpay.com https://app.posthog.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://img.youtube.com https://*.amazonaws.com https://lh3.googleusercontent.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://checkout.razorpay.com",
              "connect-src 'self' https://api.ayushman.world https://app.posthog.com https://sentry.io",
            ].join('; '),
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/find-help', destination: '/research', permanent: true },
    ]
  },

  webpack(config) {
    config.resolve.fallback = { fs: false, net: false, tls: false }
    return config
  },
}

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
})
