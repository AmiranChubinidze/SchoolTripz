'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bookingsApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { ArrowLeft, Check, X, Loader2, MapPin, Clock, Users, Bus, Utensils } from 'lucide-react'

const TRANSPORT_LABELS: Record<string, string> = { bus: 'Coach', train: 'Train', flight: 'Flight', ferry: 'Ferry' }

export default function AdminBookingDetailPage() {
  const { id } = useParams()
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    bookingsApi.adminOne(id as string)
      .then(({ data }) => { setBooking(data); setNotes(data.adminNotes || '') })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function changeStatus(status: string) {
    setActionLoading(true)
    try {
      const { data } = await bookingsApi.updateStatus(id as string, status, notes)
      setBooking(data)
      toast({ title: `Booking ${status}` })
    } catch (err: any) {
      toast({ title: err.response?.data?.message || 'Action failed', variant: 'destructive' })
    }
    setActionLoading(false)
  }

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div></AdminLayout>
  if (!booking) return <AdminLayout><div className="text-center py-20"><Link href="/admin/bookings"><Button variant="outline">Back</Button></Link></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link href="/admin/bookings">
            <button className="p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{booking.trip?.title}</h1>
            <p className="text-sm text-slate-500">ID: {booking._id?.slice(-8).toUpperCase()}</p>
          </div>
          <span className={`status-badge capitalize ${getStatusColor(booking.status)}`}>{booking.status}</span>
        </div>

        {/* Client info */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Client Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Name</span><p className="font-medium">{booking.client?.name}</p></div>
            <div><span className="text-slate-500">Email</span><p className="font-medium">{booking.client?.email}</p></div>
            {booking.client?.school && <div><span className="text-slate-500">School</span><p className="font-medium">{booking.client.school}</p></div>}
            {booking.client?.phone && <div><span className="text-slate-500">Phone</span><p className="font-medium">{booking.client.phone}</p></div>}
            <div><span className="text-slate-500">Submitted</span><p className="font-medium">{formatDate(booking.createdAt)}</p></div>
          </CardContent>
        </Card>

        {/* Trip & config */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Trip Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex gap-2 text-slate-600"><MapPin className="h-4 w-4 text-indigo-500 flex-shrink-0" />{booking.trip?.destination}</div>
              <div className="flex gap-2 text-slate-600"><Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />Start: {formatDate(booking.config.startDate)}</div>
              <div className="flex gap-2 text-slate-600"><Users className="h-4 w-4 text-indigo-500 flex-shrink-0" />{booking.config.students} students, {booking.config.adults} adults</div>
              <div className="flex gap-2 text-slate-600"><Bus className="h-4 w-4 text-indigo-500 flex-shrink-0" />{TRANSPORT_LABELS[booking.config.transportType]}</div>
              <div className="flex gap-2 text-slate-600"><Utensils className="h-4 w-4 text-indigo-500 flex-shrink-0" />{booking.config.mealsPerDay} meals/day</div>
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
              ].filter(r => r.value > 0).map(({ label, value }) => (
                <div key={label} className="flex justify-between text-slate-600">
                  <span>{label}</span><span>{formatCurrency(value)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-bold text-slate-900">
                <span>Total</span><span className="text-indigo-600">{formatCurrency(booking.priceBreakdown.total)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Per student</span><span>{formatCurrency(booking.priceBreakdown.perStudent)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notes & Actions */}
        {booking.status === 'pending' && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Review & Decision</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="adminNotes">Admin notes (sent to client)</label>
                <textarea
                  id="adminNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional message for the client..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => changeStatus('approved')} disabled={actionLoading} className="flex-1 bg-green-600 hover:bg-green-700">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
                  Approve
                </Button>
                <Button onClick={() => changeStatus('rejected')} disabled={actionLoading} variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <X className="h-4 w-4 mr-1.5" />}
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {booking.adminNotes && booking.status !== 'pending' && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Admin Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{booking.adminNotes}</p>
            </CardContent>
          </Card>
        )}

        {booking.clientNotes && (
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Client Notes</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{booking.clientNotes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
