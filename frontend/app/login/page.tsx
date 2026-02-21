'use client'
import { Suspense } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/hooks/use-toast'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      setAuth(data.user, data.token)
      toast({ title: `Welcome back, ${data.user.name.split(' ')[0]}!` })
      const redirect = searchParams.get('redirect')
      if (redirect) { router.push(redirect); return }
      router.push(data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl text-slate-900 mb-8">
          <GraduationCap className="h-7 w-7 text-indigo-600" aria-hidden="true" />
          SchoolTripz
        </Link>

        <div className="bg-white rounded-xl border shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Sign in to your account</h1>
            <p className="text-sm text-slate-600 mt-1">Access your school's trip dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@school.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                aria-describedby={error ? 'login-error' : undefined}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p id="login-error" role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-sm text-center text-slate-600 mt-5">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Register your school
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-xs text-indigo-700 space-y-1">
          <p className="font-semibold mb-2">Demo credentials:</p>
          <p>Admin: <code>admin@schooltripz.com</code> / <code>Admin123!</code></p>
          <p>Client: <code>sarah@greenviewschool.com</code> / <code>Client123!</code></p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-offwhite flex items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" /></div>}>
      <LoginContent />
    </Suspense>
  )
}
