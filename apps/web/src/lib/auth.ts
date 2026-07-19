import { publicClient, apiClient, type ApiError } from './api-client'
import type { AuthUser, TokenPair } from '@ayushman/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  phone?: string
  role?: string
}

export interface AuthResponse {
  user: AuthUser
  tokens: TokenPair
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await publicClient.post<{ data: AuthResponse }>('/auth/register', data)
    return res.data.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await publicClient.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await publicClient.post('/auth/reset-password', { token, password })
  },

  verifyEmail: async (token: string): Promise<void> => {
    await publicClient.post('/auth/verify-email', { token })
  },

  resendVerification: async (): Promise<void> => {
    await apiClient.post('/auth/resend-verification')
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.patch('/auth/change-password', { currentPassword, newPassword })
  },

  logoutAll: async (): Promise<void> => {
    await apiClient.post('/auth/logout-all')
  },

  getMe: async (): Promise<AuthUser> => {
    const res = await apiClient.get<{ data: { user: AuthUser } }>('/auth/me')
    return res.data.data.user
  },
}
