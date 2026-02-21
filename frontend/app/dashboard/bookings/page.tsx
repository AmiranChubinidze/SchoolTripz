'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bookingsApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { MapPin, Clock, Users, Plus, BookOpen, ChevronRight } from 'lucide-react'

interface Booking {
  _id: string; status: string; createdAt: string
  trip: { title: string; destination: string; durationDays: number }
  config: { students: number; adults: number; startDate: string }
  priceBreakdown: { total: number; perStudent: number }
}

const STATUS_FILTERS = ['all', 'pending', 'approved', 'confirmed', 'cancelled', 'rejected']

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [total, setTotal] = useState(0)

  useEffect(() => {
    setLoading(true)
    const params: any = { limit: 20 }
    if (statusFilter !== 'all') params.status = statusFilter
    bookingsApi.myList(params)
      .then(({ data }) => { setBookings(data.bookings); setTotal(data.total) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-slate-600 mt-1">Track the status of all your trip requests.</p>
          </div>
          <Link href="/dashboard/trips">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> New Booking
            </Button>
          </Link>
        </div>

        {/* Status filters */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border capitalize ${
                statusFilter === s
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">No bookings found</h3>
              <p className="text-sm text-slate-600 mb-5">
                {statusFilter !== 'all' ? 'No bookings with this status.' : 'Start by browsing our available trips.'}
              </p>
              <Link href="/dashboard/trips"><Button size="sm">Browse Trips</Button></Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Link key={booking._id} href={`/dashboard/bookings/${booking._id}`} className="block group">
                <div className="bg-white border rounded-xl p-5 hover:shadow-md transition-all hover:border-indigo-200 cursor-pointer">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900 truncate">{booking.trip?.title}</h3>
                        <span className={`status-badge flex-shrink-0 ${getStatusColor(booking.status)} capitalize`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{booking.trip?.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {booking.config?.startDate ? formatDate(booking.config.startDate) : '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.config?.students} students{booking.config?.adults > 0 ? `, ${booking.config.adults} adults` : ''}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-900">{formatCurrency(booking.priceBreakdown?.total)}</p>
                      <p className="text-xs text-slate-500">{formatCurrency(booking.priceBreakdown?.perStudent)}/student</p>
                      <ChevronRight className="h-4 w-4 text-slate-400 ml-auto mt-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
