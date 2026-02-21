'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { toast } from '@/hooks/use-toast'

export default function RegisterPage() {
  const router = useRouter()
  const { setAuth } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', school: '', phone: '',
  })

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      setAuth(data.user, data.token)
      toast({ title: 'Account created!', description: 'Welcome to SchoolTripz.' })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl text-slate-900 mb-8">
          <GraduationCap className="h-7 w-7 text-indigo-600" aria-hidden="true" />
          SchoolTripz
        </Link>

        <div className="bg-white rounded-xl border shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-600 mt-1">Free for schools. No credit card required.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" type="text" autoComplete="name" required placeholder="Jane Smith" value={form.name} onChange={update('name')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" type="email" autoComplete="email" required placeholder="jane@yourschool.edu" value={form.email} onChange={update('email')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="school">School name</Label>
              <Input id="school" type="text" placeholder="Greenview High School" value={form.school} onChange={update('school')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number <span className="text-slate-400 font-normal">(optional)</span></Label>
              <Input id="phone" type="tel" autoComplete="tel" placeholder="+44 7700 900000" value={form.phone} onChange={update('phone')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={update('password')}
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
              <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-xs text-center text-slate-500">
              By registering you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="text-sm text-center text-slate-600 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
