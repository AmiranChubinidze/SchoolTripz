'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { bookingsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import {
  MapPin, Clock, Plus, ChevronRight, Compass,
  ArrowUpRight, FileText,
} from 'lucide-react'

interface Booking {
  _id: string
  status: string
  createdAt: string
  trip: { title: string; destination: string; durationDays: number }
  config: { students: number; startDate: string }
  priceBreakdown: { total: number }
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    bookingsApi.myList({ limit: 6 })
      .then(({ data }) => setBookings(data.bookings))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const firstName = user?.name?.split(' ')[0]

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-brand-600 mb-1">
              {user?.school ?? 'Dashboard'}
            </p>
            <h1
              className="text-2xl font-bold text-ink"
              style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', letterSpacing: '-0.02em' }}
            >
              Welcome back, {firstName}.
            </h1>
          </div>

          {/* Primary action */}
          <Link href="/dashboard/trips">
            <Button size="lg" className="gap-2 shadow-md shadow-brand-600/15 w-full sm:w-auto">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Create New Trip
            </Button>
          </Link>
        </div>

        {/* ── Quick actions ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/dashboard/trips" className="group">
            <div
              className="flex items-center gap-4 p-5 rounded-xl border border-black/[0.06] bg-white hover:border-brand-200 hover:shadow-md hover:shadow-brand-600/5 transition-all duration-200 cursor-pointer"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.1)' }}
              >
                <Compass className="h-5 w-5 text-brand-600" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm" style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}>
                  Browse Destinations
                </p>
                <p className="text-xs text-black/45 mt-0.5">40+ curriculum-linked trips</p>
              </div>
              <ChevronRight className="h-4 w-4 text-black/25 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </div>
          </Link>

          <Link href="/dashboard/bookings" className="group">
            <div
              className="flex items-center gap-4 p-5 rounded-xl border border-black/[0.06] bg-white hover:border-brand-200 hover:shadow-md hover:shadow-brand-600/5 transition-all duration-200 cursor-pointer"
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,0,0,0.04)' }}
              >
                <FileText className="h-5 w-5 text-black/50" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm" style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}>
                  My Bookings
                </p>
                <p className="text-xs text-black/45 mt-0.5">View and manage requests</p>
              </div>
              <ChevronRight className="h-4 w-4 text-black/25 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </div>
          </Link>
        </div>

        {/* ── Recent bookings ──────────────────────────────── */}
        <div className="rounded-xl border border-black/[0.06] bg-white overflow-hidden">
          {/* Table header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.05]">
            <h2
              className="text-sm font-bold text-ink"
              style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
            >
              Recent Bookings
            </h2>
            <Link href="/dashboard/bookings">
              <button className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors cursor-pointer">
                View all
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </Link>
          </div>

          {/* Content */}
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-14 rounded-lg" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            /* Empty state */
            <div className="py-20 px-6 text-center">
              <div
                className="h-14 w-14 rounded-xl flex items-center justify-center mx-auto mb-5"
                style={{ background: 'rgba(124,58,237,0.08)' }}
              >
                <MapPin className="h-7 w-7 text-brand-500" aria-hidden="true" />
              </div>
              <p
                className="text-base font-bold text-ink mb-1.5"
                style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
              >
                Your first trip starts here.
              </p>
              <p className="text-sm text-black/45 mb-6">
                Browse destinations and build a quote in minutes.
              </p>
              <Link href="/dashboard/trips">
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  Create Trip
                </Button>
              </Link>
            </div>
          ) : (
            /* Booking rows */
            <div className="divide-y divide-black/[0.04]">
              {bookings.map((booking) => (
                <Link key={booking._id} href={`/dashboard/bookings/${booking._id}`} className="group block">
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-brand-50/40 transition-colors cursor-pointer">
                    {/* Status dot */}
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0"
                      style={{
                        background:
                          booking.status === 'confirmed' ? '#16a34a'
                          : booking.status === 'pending' ? '#d97706'
                          : booking.status === 'approved' ? '#7C3AED'
                          : '#6b7280',
                      }}
                      aria-hidden="true"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate" style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}>
                        {booking.trip?.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-black/40">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {booking.trip?.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {formatDate(booking.config?.startDate)}
                        </span>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span className={`status-badge ${getStatusColor(booking.status)} capitalize text-[11px]`}>
                        {booking.status}
                      </span>
                      <span className="text-xs font-semibold text-ink">
                        {formatCurrency(booking.priceBreakdown?.total)}
                      </span>
                    </div>

                    <ChevronRight className="h-4 w-4 text-black/20 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" aria-hidden="true" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
