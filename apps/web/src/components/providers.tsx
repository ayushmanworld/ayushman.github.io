'use client'

import { type ReactNode, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from '@/components/ui/toaster'

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always create new client
    return makeQueryClient()
  }
  // Browser: reuse singleton
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

interface ProvidersProps {
  readonly children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  )
}
