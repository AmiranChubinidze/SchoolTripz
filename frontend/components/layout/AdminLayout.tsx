'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  GraduationCap, LayoutDashboard, MapPin, BookOpen, Users,
  CalendarDays, BarChart3, LogOut, Menu, X,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const adminNav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
  { href: '/admin/trips', icon: MapPin, label: 'Trips' },
  { href: '/admin/availability', icon: CalendarDays, label: 'Availability' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
]

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, clearAuth } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    if (user.role !== 'admin') router.push('/dashboard')
  }, [user, router])

  const handleLogout = () => { clearAuth(); router.push('/') }

  if (!user || user.role !== 'admin') return null

  return (
    <div className="min-h-screen flex" style={{ background: '#0D1526' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-56 flex flex-col transform transition-transform duration-300',
          'md:relative md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: '#07090F', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Logo */}
        <div
          className="h-14 px-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <GraduationCap className="h-5 w-5 flex-shrink-0" style={{ color: '#7C3AED' }} aria-hidden="true" />
            <span className="text-sm font-semibold text-white tracking-tight truncate">SchoolTripz</span>
          </Link>
          <button
            className="md:hidden p-1 cursor-pointer"
            style={{ color: '#6B7A96' }}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Section label */}
        <div className="px-5 pt-5 pb-2">
          <span
            className="text-[10px] font-semibold tracking-[0.14em] uppercase"
            style={{ color: '#2E3D56' }}
          >
            Navigation
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto" aria-label="Admin navigation">
          {adminNav.map(({ href, icon: Icon, label }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 py-2.5 rounded-md text-sm transition-all duration-150 cursor-pointer',
                  active ? 'text-white font-medium' : 'font-normal',
                )}
                style={
                  active
                    ? {
                        paddingLeft: '10px',
                        paddingRight: '12px',
                        color: 'white',
                        background: 'rgba(124,58,237,0.1)',
                        borderLeft: '2px solid #7C3AED',
                      }
                    : { paddingLeft: '12px', paddingRight: '12px', color: '#6B7A96' }
                }
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User area */}
        <div
          className="px-3 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0 text-xs font-bold"
              style={{ background: '#141F35', color: '#A78BFA' }}
            >
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: '#3D4F6E' }}>Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-xs transition-colors cursor-pointer group"
            style={{ color: '#6B7A96' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7A96')}
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header
          className="h-14 flex items-center px-4 md:hidden flex-shrink-0"
          style={{ background: '#07090F', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 cursor-pointer"
            style={{ color: '#6B7A96' }}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 ml-3 text-sm font-semibold text-white">
            <GraduationCap className="h-4 w-4" style={{ color: '#7C3AED' }} aria-hidden="true" />
            Admin
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}
