import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: '*.amazonaws.com' },
      { protocol: 'https', hostname: 'r2.ayushman.world' },
    ],
  },
  experimental: {
    serverActions: { allowedOrigins: ['ayushman.world', 'localhost:3000'] },
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
  async rewrites() {
    return [
      { source: '/api/backend/:path*', destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*` },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  silent: true,
  org: 'ayushman',
  project: 'ayushman-frontend',
})
