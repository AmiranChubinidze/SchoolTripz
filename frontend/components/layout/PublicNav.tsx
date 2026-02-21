'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export function PublicNav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user } = useAuthStore()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-ink/95 backdrop-blur-md border-b border-white/[0.08] shadow-lg shadow-black/20'
          : 'bg-ink border-b border-white/[0.06]',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5"
            aria-label="SchoolTripz home"
          >
            <span
              className="text-xl font-bold text-white tracking-tight"
              style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', letterSpacing: '-0.02em' }}
            >
              School<span className="gradient-text-static">Tripz</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <Link
              href="/trips"
              className="text-sm text-white/60 hover:text-white transition-colors duration-150 font-medium"
            >
              Browse Trips
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm text-white/60 hover:text-white transition-colors duration-150 font-medium"
            >
              How It Works
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/50 font-medium">
                  Hi, {user.name?.split(' ')[0]}
                </span>
                <Link href={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button size="sm">Dashboard</Button>
                </Link>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost-white" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Start Planning</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-white/60 hover:text-white transition-colors cursor-pointer"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <div className="md:hidden border-t border-white/[0.08] py-5 flex flex-col gap-1 animate-fade-in">
            <Link
              href="/trips"
              className="text-sm text-white/70 hover:text-white py-2.5 px-2 rounded hover:bg-white/5 transition-colors font-medium"
              onClick={() => setOpen(false)}
            >
              Browse Trips
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm text-white/70 hover:text-white py-2.5 px-2 rounded hover:bg-white/5 transition-colors font-medium"
              onClick={() => setOpen(false)}
            >
              How It Works
            </Link>
            <div className="pt-4 flex flex-col gap-2 border-t border-white/[0.08]">
              {user ? (
                <>
                  <p className="text-xs text-white/35 font-medium px-1 pb-1">Hi, {user.name?.split(' ')[0]}</p>
                  <Link href={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setOpen(false)}>
                    <Button className="w-full" size="sm">Dashboard</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline-white" className="w-full" size="sm">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full" size="sm">Start Planning</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
