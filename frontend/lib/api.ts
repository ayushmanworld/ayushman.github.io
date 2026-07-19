import axios, { AxiosError, AxiosInstance } from 'axios'
import { getSession, signOut } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
})

// Request: attach JWT
api.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
})

// Response: handle 401 refresh / logout
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await signOut({ redirect: true, callbackUrl: '/login' })
    }
    return Promise.reject(error)
  }
)

// ── Resource API ──────────────────────────────────────────

export const resourcesApi = {
  search: (params: {
    query?: string
    type?: string
    city?: string
    state?: string
    age?: string
    diagnosis?: string
    need?: string
    page?: number
    limit?: number
  }) => api.get('/resources', { params }),

  getById: (id: string) => api.get(`/resources/${id}`),

  suggest: (data: {
    name: string
    type: string
    city: string
    state: string
    url?: string
    email: string
    description?: string
  }) => api.post('/resources/suggest', data),

  logView: (id: string, userInfo: { city?: string; country?: string }) =>
    api.post(`/resources/${id}/view`, userInfo),
}

// ── Video API ─────────────────────────────────────────────

export const videosApi = {
  getAll: (params: {
    query?: string
    category?: string
    language?: string
    age?: string
    page?: number
    limit?: number
  }) => api.get('/videos', { params }),

  logView: (videoId: number, data: { title: string; location?: string }) =>
    api.post('/videos/view', { videoId, ...data }),

  search: (query: string, filters: Record<string, string>) =>
    api.get('/videos/search', { params: { q: query, ...filters } }),
}

// ── Donation API ──────────────────────────────────────────

export const donationsApi = {
  createOrder: (data: {
    amount: number
    currency: 'INR'
    cause?: string
    donorName: string
    donorEmail: string
    donorPhone: string
    country: string
    state?: string
    message?: string
  }) => api.post('/donations/create-order', data),

  verifyPayment: (data: {
    orderId: string
    paymentId: string
    signature: string
  }) => api.post('/donations/verify', data),

  getReceipt: (donationId: string) =>
    api.get(`/donations/${donationId}/receipt`),

  getPublicStats: () => api.get('/donations/stats/public'),
}

// ── Partner API ───────────────────────────────────────────

export const partnersApi = {
  register: (data: PartnerRegistrationData) =>
    api.post('/partners/register', data),

  getApproved: () => api.get('/partners/approved'),

  getById: (id: string) => api.get(`/partners/${id}`),
}

// ── AI / RAG API ──────────────────────────────────────────

export const aiApi = {
  query: (data: {
    query: string
    childAge?: string
    diagnosis?: string
    city?: string
    language?: 'en' | 'hi'
    sessionId?: string
  }) => api.post('/ai/query', data),

  getSuggestions: (partial: string) =>
    api.get('/ai/suggestions', { params: { q: partial } }),

  logFeedback: (data: {
    sessionId: string
    helpful: boolean
    comment?: string
  }) => api.post('/ai/feedback', data),
}

// ── Analytics API ─────────────────────────────────────────

export const analyticsApi = {
  recordSearch: (data: {
    query: string
    filters: Record<string, string>
    resultsCount: number
    page: 'research' | 'videos' | 'home'
    location?: { country?: string; state?: string; city?: string }
  }) => api.post('/analytics/search', data),

  recordDonation: (country: string, state?: string) =>
    api.post('/analytics/donation-location', { country, state }),

  getPublicDashboard: () => api.get('/analytics/public'),
}

// ── Types ─────────────────────────────────────────────────

export interface PartnerRegistrationData {
  orgName: string
  orgType: string
  description: string
  yearEstablished?: number
  childrenServed?: number
  services: string[]
  ageGroups: string
  conditions?: string
  feeSession?: number
  feeMonthly?: number
  feeAssessment?: number
  feeSchool?: number
  hasConcession: string
  hasFreeSlots: string
  address: string
  city: string
  state: string
  pinCode?: string
  googleMapsUrl?: string
  phone: string
  whatsapp?: string
  email: string
  website?: string
  workingDays: string
  workingHours: string
  appointmentRequired: string
  onlineSessions: string
  contactName: string
  contactTitle?: string
  contactPhone: string
  contactEmail: string
  message?: string
}
