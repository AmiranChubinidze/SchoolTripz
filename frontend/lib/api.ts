import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('st_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('st_token')
      localStorage.removeItem('st_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// --- Auth ---
export const authApi = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// --- Uploads ---
export const uploadsApi = {
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// --- Settings ---
export const settingsApi = {
  get: () => api.get('/settings'),
  set: (key: string, value: any) => api.patch(`/settings/${key}`, { value }),
}

// --- Trips ---
export const tripsApi = {
  list: (params?: any) => api.get('/trips', { params }),
  bySlug: (slug: string) => api.get(`/trips/slug/${slug}`),
  pricing: (id: string) => api.get(`/trips/${id}/pricing`),
  adminList: (params?: any) => api.get('/trips/admin/all', { params }),
  create: (data: any) => api.post('/trips', data),
  update: (id: string, data: any) => api.patch(`/trips/${id}`, data),
  remove: (id: string) => api.delete(`/trips/${id}`),
  categories: () => api.get('/trips/categories'),
}

// --- Bookings ---
export const bookingsApi = {
  create: (data: any) => api.post('/bookings', data),
  myList: (params?: any) => api.get('/bookings/my', { params }),
  myOne: (id: string) => api.get(`/bookings/my/${id}`),
  confirm: (id: string) => api.patch(`/bookings/my/${id}/confirm`),
  cancel: (id: string, reason?: string) => api.patch(`/bookings/my/${id}/cancel`, { reason }),
  adminList: (params?: any) => api.get('/bookings', { params }),
  adminOne: (id: string) => api.get(`/bookings/${id}`),
  kanban: () => api.get('/bookings/kanban'),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/bookings/${id}/status`, { status, notes }),
}

// --- Pricing ---
export const pricingApi = {
  quote: (data: any) => api.post('/pricing/quote', data),
  rules: (tripId?: string) => api.get('/pricing/rules', { params: { tripId } }),
  createRule: (data: any) => api.post('/pricing/rules', data),
  updateRule: (id: string, data: any) => api.patch(`/pricing/rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/pricing/rules/${id}`),
}

// --- Availability ---
export const availApi = {
  forTrip: (tripId: string, from?: string, to?: string) =>
    api.get(`/availability/trips/${tripId}`, { params: { from, to } }),
  upsert: (tripId: string, data: any) => api.post(`/availability/trips/${tripId}`, data),
  bulk: (tripId: string, dates: any[]) => api.post(`/availability/trips/${tripId}/bulk`, { dates }),
}

// --- Users ---
export const usersApi = {
  list: (params?: any) => api.get('/users', { params }),
  one: (id: string) => api.get(`/users/${id}`),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  deactivate: (id: string) => api.delete(`/users/${id}`),
  updateProfile: (data: any) => api.patch('/users/profile', data),
}

// --- Analytics ---
export const analyticsApi = {
  dashboard: () => api.get('/analytics/dashboard'),
}
