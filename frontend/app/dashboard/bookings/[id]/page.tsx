'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bookingsApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import {
  ArrowLeft, MapPin, Clock, Users, Bus, Utensils, PackagePlus,
  CheckCircle, XCircle, AlertCircle, Loader2,
} from 'lucide-react'

interface Booking {
  _id: string; status: string; createdAt: string; clientNotes: string; adminNotes: string
  trip: { _id: string; title: string; destination: string; durationDays: number; images: string[] }
  config: { students: number; adults: number; startDate: string; mealsPerDay: number; transportType: string; selectedExtras: string[] }
  priceBreakdown: { baseStudents: number; baseAdults: number; meals: number; transport: number; extras: number; total: number; perStudent: number }
}

const STATUS_FLOW = [
  { key: 'pending', label: 'Pending Review', icon: Clock },
  { key: 'approved', label: 'Approved', icon: CheckCircle },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
]

const TRANSPORT_LABELS: Record<string, string> = { bus: 'Coach', train: 'Train', flight: 'Flight', ferry: 'Ferry' }

export default function BookingDetailPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    bookingsApi.myOne(id as string)
      .then(({ data }) => setBooking(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function handleConfirm() {
    setActionLoading(true)
    try {
      const { data } = await bookingsApi.confirm(id as string)
      setBooking(data)
      toast({ title: 'Booking confirmed!' })
    } catch { toast({ title: 'Failed to confirm', variant: 'destructive' }) }
    setActionLoading(false)
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this booking?')) return
    setActionLoading(true)
    try {
      const { data } = await bookingsApi.cancel(id as string)
      setBooking(data)
      toast({ title: 'Booking cancelled' })
    } catch { toast({ title: 'Failed to cancel', variant: 'destructive' }) }
    setActionLoading(false)
  }

  if (loading) {
    return <DashboardLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div></DashboardLayout>
  }

  if (!booking) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-slate-600 mb-4">Booking not found.</p>
          <Link href="/dashboard/bookings"><Button variant="outline">Back to Bookings</Button></Link>
        </div>
      </DashboardLayout>
    )
  }

  const statusIdx = STATUS_FLOW.findIndex((s) => s.key === booking.status)
  const isCancelled = ['cancelled', 'rejected'].includes(booking.status)

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/bookings">
            <button className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{booking.trip?.title}</h1>
            <p className="text-sm text-slate-500">Booking reference: {booking._id.slice(-8).toUpperCase()}</p>
          </div>
          <span className={`ml-auto status-badge ${getStatusColor(booking.status)} capitalize`}>
            {booking.status}
          </span>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                {STATUS_FLOW.map(({ key, label, icon: Icon }, i) => {
                  const done = i <= statusIdx
                  return (
                    <div key={key} className="flex-1 flex flex-col items-center gap-1.5 relative">
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`absolute top-3.5 left-1/2 w-full h-0.5 ${i < statusIdx ? 'bg-indigo-500' : 'bg-slate-200'}`} aria-hidden="true" />
                      )}
                      <div className={`relative z-10 h-7 w-7 rounded-full flex items-center justify-center border-2 ${done ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                        <Icon className={`h-3.5 w-3.5 ${done ? 'text-white' : 'text-slate-400'}`} aria-hidden="true" />
                      </div>
                      <span className={`text-xs text-center leading-tight ${done ? 'text-indigo-700 font-medium' : 'text-slate-400'}`}>{label}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin message */}
        {booking.adminNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Message from our team</p>
              <p className="text-sm text-blue-700 mt-0.5">{booking.adminNotes}</p>
            </div>
          </div>
        )}

        {/* Action for approved */}
        {booking.status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-3">
                  Your booking has been approved! Please confirm to lock it in.
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleConfirm} disabled={actionLoading} size="sm" className="bg-green-600 hover:bg-green-700">
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <CheckCircle className="h-4 w-4 mr-1.5" />}
                    Confirm Booking
                  </Button>
                  <Button onClick={handleCancel} disabled={actionLoading} size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trip details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Trip Details</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2 text-slate-600"><MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />{booking.trip?.destination}</div>
              <div className="flex gap-2 text-slate-600"><Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />{booking.trip?.durationDays} days · Start: {formatDate(booking.config.startDate)}</div>
              <div className="flex gap-2 text-slate-600"><Users className="h-4 w-4 text-indigo-500 flex-shrink-0" />{booking.config.students} students, {booking.config.adults} adults</div>
              <div className="flex gap-2 text-slate-600"><Bus className="h-4 w-4 text-indigo-500 flex-shrink-0" />{TRANSPORT_LABELS[booking.config.transportType]}</div>
              <div className="flex gap-2 text-slate-600"><Utensils className="h-4 w-4 text-indigo-500 flex-shrink-0" />{booking.config.mealsPerDay} meal{booking.config.mealsPerDay !== 1 ? 's' : ''}/day</div>
              {booking.config.selectedExtras?.length > 0 && (
                <div className="flex gap-2 text-slate-600"><PackagePlus className="h-4 w-4 text-indigo-500 flex-shrink-0" />{booking.config.selectedExtras.join(', ')}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Price Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              {[
                { label: 'Students', value: booking.priceBreakdown.baseStudents },
                { label: 'Adults', value: booking.priceBreakdown.baseAdults },
                { label: 'Meals', value: booking.priceBreakdown.meals },
                { label: 'Transport', value: booking.priceBreakdown.transport },
                { label: 'Extras', value: booking.priceBreakdown.extras },
              ].filter((r) => r.value > 0).map(({ label, value }) => (
                <div key={label} className="flex justify-between text-slate-600">
                  <span>{label}</span><span>{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold text-slate-900">
                <span>Total</span>
                <span className="text-indigo-600">{formatCurrency(booking.priceBreakdown.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Per student</span><span>{formatCurrency(booking.priceBreakdown.perStudent)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Cancel */}
        {!['cancelled', 'rejected', 'confirmed'].includes(booking.status) && booking.status !== 'approved' && (
          <div className="text-right">
            <Button onClick={handleCancel} disabled={actionLoading} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              <XCircle className="h-4 w-4 mr-1.5" /> Cancel Booking
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
