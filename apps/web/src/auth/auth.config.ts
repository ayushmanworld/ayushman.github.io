import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import type { AuthUser } from '@ayushman/types'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

declare module 'next-auth' {
  interface Session {
    user: AuthUser
    accessToken: string
    refreshToken: string
    error?: 'RefreshTokenExpired' | 'RefreshTokenError'
  }

  interface User extends AuthUser {
    accessToken: string
    refreshToken: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    user: AuthUser
    accessToken: string
    refreshToken: string
    accessTokenExpires: number
    error?: 'RefreshTokenExpired' | 'RefreshTokenError'
  }
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      throw new Error('RefreshTokenExpired')
    }

    const data = (await response.json()) as {
      data: { tokens: { accessToken: string; refreshToken: string; expiresIn: number } }
    }
    const { tokens } = data.data

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpires: Date.now() + tokens.expiresIn * 1000,
    }
  } catch {
    return { error: 'RefreshTokenError' as const }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (credentials?.email === undefined || credentials?.password === undefined) {
          return null
        }

        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = (await response.json()) as {
            data: {
              user: AuthUser
              tokens: { accessToken: string; refreshToken: string; expiresIn: number }
            }
          }

          return {
            id: data.data.user.id,
            ...data.data.user,
            accessToken: data.data.tokens.accessToken,
            refreshToken: data.data.tokens.refreshToken,
          }
        } catch {
          return null
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user !== undefined && user !== null) {
        return {
          ...token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isVerified: user.isVerified,
            avatarUrl: user.avatarUrl,
          } as AuthUser,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: Date.now() + 15 * 60 * 1000, // 15 minutes
        }
      }

      // Return existing token if not expired
      if (Date.now() < (token.accessTokenExpires ?? 0)) {
        return token
      }

      // Refresh expired token
      const refreshed = await refreshAccessToken(token.refreshToken)

      if ('error' in refreshed) {
        return { ...token, error: 'RefreshTokenExpired' as const }
      }

      return { ...token, ...refreshed }
    },

    async session({ session, token }) {
      session.user = token.user
      session.accessToken = token.accessToken
      session.refreshToken = token.refreshToken
      if (token.error !== undefined) {
        session.error = token.error
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env['NEXTAUTH_SECRET'],
})
