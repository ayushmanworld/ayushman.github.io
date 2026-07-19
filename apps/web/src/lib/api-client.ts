import axios, { type AxiosError, type AxiosInstance } from 'axios'
import { getSession, signOut } from 'next-auth/react'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.accessToken !== undefined) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: '/login' })
    }
    return Promise.reject(error)
  },
)

// Public client (no auth)
export const publicClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Type-safe API error
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

export function isApiError(error: unknown): error is AxiosError<{ error: ApiError }> {
  return axios.isAxiosError(error)
}

export function getApiErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return (
      error.response?.data?.error?.message ??
      error.message ??
      'An unexpected error occurred'
    )
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}
