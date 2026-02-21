'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, MapPin, BookOpen, LogOut,
  Menu, X, User, ChevronRight,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const clientNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/trips', icon: MapPin, label: 'Browse Trips' },
  { href: '/dashboard/bookings', icon: BookOpen, label: 'My Bookings' },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  const handleLogout = () => {
    clearAuth()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r flex flex-col transform transition-transform duration-300',
        'md:relative md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      )}>
        {/* Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900">
            <GraduationCap className="h-6 w-6 text-indigo-600" aria-hidden="true" />
            SchoolTripz
          </Link>
          <button
            className="md:hidden p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Dashboard navigation">
          {clientNav.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer',
                pathname === href
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              )}
              aria-current={pathname === href ? 'page' : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {label}
              {pathname === href && <ChevronRight className="h-3 w-3 ml-auto text-indigo-500" aria-hidden="true" />}
            </Link>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-indigo-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.school || user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="h-16 border-b bg-white flex items-center px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 ml-3 font-semibold text-slate-900">
            <GraduationCap className="h-5 w-5 text-indigo-600" />
            SchoolTripz
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
