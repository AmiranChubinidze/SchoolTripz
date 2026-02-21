'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
  name: string
  email: string
  role: 'client' | 'admin'
  school?: string
  phone?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  clearAuth: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('st_token', token)
          localStorage.setItem('st_user', JSON.stringify(user))
        }
        set({ user, token })
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('st_token')
          localStorage.removeItem('st_user')
        }
        set({ user: null, token: null })
      },
      isAdmin: () => get().user?.role === 'admin',
    }),
    { name: 'schooltripz-auth', partialize: (s) => ({ user: s.user, token: s.token }) },
  ),
)
