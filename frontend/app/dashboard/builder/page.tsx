'use client'
import { Suspense } from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { tripsApi, pricingApi, bookingsApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import {
  Users, Calendar, Utensils, Bus, PackagePlus, Calculator,
  ChevronRight, Loader2, CheckCircle, ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

interface Trip {
  _id: string; title: string; destination: string; durationDays: number
  availableTransport: string[]; availableExtras: Record<string, number>
  priceConfig: { basePerStudent: number; basePerAdult: number; mealPerPersonPerDay: number; transportSurcharge: Record<string, number> }
  minStudents: number; maxStudents: number
}

interface Quote {
  baseStudents: number; baseAdults: number; meals: number; transport: number
  extras: number; discount: number; total: number; perStudent: number; appliedRules: string[]
}

const TRANSPORT_LABELS: Record<string, string> = {
  bus: 'Coach', train: 'Train', flight: 'Flight', ferry: 'Ferry',
}

function TripBuilderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = searchParams.get('tripId') || ''

  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(!!tripId)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const [config, setConfig] = useState({
    students: 25, adults: 2, startDate: '', mealsPerDay: 2,
    transportType: 'bus', selectedExtras: [] as string[], notes: '',
  })

  useEffect(() => {
    if (!tripId) return
    tripsApi.pricing(tripId)
      .then(({ data }) => {
        setTrip(data)
        if (data.availableTransport?.[0]) {
          setConfig((c) => ({ ...c, transportType: data.availableTransport[0] }))
        }
      })
      .catch(() => toast({ title: 'Trip not found', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [tripId])

  const calculateQuote = useCallback(async () => {
    if (!trip || !config.startDate) return
    setQuoteLoading(true)
    try {
      const { data } = await pricingApi.quote({
        tripId: trip._id, students: config.students, adults: config.adults,
        startDate: config.startDate, mealsPerDay: config.mealsPerDay,
        transportType: config.transportType, selectedExtras: config.selectedExtras,
      })
      setQuote(data)
    } catch {
      toast({ title: 'Failed to calculate quote', variant: 'destructive' })
    }
    setQuoteLoading(false)
  }, [trip, config])

  // Auto-recalculate
  useEffect(() => {
    if (!trip || !config.startDate) return
    const t = setTimeout(calculateQuote, 600)
    return () => clearTimeout(t)
  }, [config, trip, calculateQuote])

  async function handleSubmit() {
    if (!quote || !trip) return
    if (!config.startDate) { toast({ title: 'Please select a start date', variant: 'destructive' }); return }
    setSubmitting(true)
    try {
      await bookingsApi.create({
        tripId: trip._id, students: config.students, adults: config.adults,
        startDate: config.startDate, mealsPerDay: config.mealsPerDay,
        transportType: config.transportType, selectedExtras: config.selectedExtras,
        clientNotes: config.notes,
      })
      setSubmitted(true)
      toast({ title: 'Booking request submitted!', description: 'We\'ll review it within 24 hours.' })
    } catch (err: any) {
      toast({ title: err.response?.data?.message || 'Submission failed', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="max-w-lg mx-auto text-center py-20 animate-fade-in">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Booking Request Submitted!</h1>
          <p className="text-slate-600 mb-8">
            Our team will review your request for <strong>{trip?.title}</strong> and get back to you within 24 hours.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/bookings"><Button>View My Bookings</Button></Link>
            <Link href="/dashboard/trips"><Button variant="outline">Browse More Trips</Button></Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (!tripId || !trip) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold text-slate-900">Trip Builder</h1>
          <Card>
            <CardContent className="p-8 text-center">
              <Calculator className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 mb-4">Select a trip first to start building your quote.</p>
              <Link href="/dashboard/trips"><Button>Browse Trips</Button></Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  const toggleExtra = (extra: string) => {
    setConfig((c) => ({
      ...c,
      selectedExtras: c.selectedExtras.includes(extra)
        ? c.selectedExtras.filter((e) => e !== extra)
        : [...c.selectedExtras, extra],
    }))
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-4">
          <Link href="/dashboard/trips">
            <button className="mt-1 p-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer" aria-label="Back to trips">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Trip Builder</h1>
            <p className="text-slate-600 mt-0.5">
              {trip.title} · {trip.destination} · {trip.durationDays} days
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config panel */}
          <div className="lg:col-span-2 space-y-5">
            {/* Group composition */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-indigo-600" /> Group Composition
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="students">Students <span className="text-slate-400 font-normal text-xs">({trip.minStudents}–{trip.maxStudents})</span></Label>
                  <Input
                    id="students" type="number"
                    min={trip.minStudents} max={trip.maxStudents}
                    value={config.students}
                    onChange={(e) => setConfig({ ...config, students: +e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adults">Adults / Teachers</Label>
                  <Input
                    id="adults" type="number" min={0}
                    value={config.adults}
                    onChange={(e) => setConfig({ ...config, adults: +e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date & Duration */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" /> Trip Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate" type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={config.startDate}
                    onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Meals */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-indigo-600" /> Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <Label htmlFor="meals">Meals per day (per person)</Label>
                  <Select
                    value={String(config.mealsPerDay)}
                    onValueChange={(v) => setConfig({ ...config, mealsPerDay: +v })}
                  >
                    <SelectTrigger id="meals">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 1, 2, 3].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n === 0 ? 'No meals included' : `${n} meal${n > 1 ? 's' : ''} per day`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transport */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bus className="h-4 w-4 text-indigo-600" /> Transport
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {trip.availableTransport.map((t) => (
                    <button
                      key={t}
                      onClick={() => setConfig({ ...config, transportType: t })}
                      className={`p-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                        config.transportType === t
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {TRANSPORT_LABELS[t] || t}
                      {trip.priceConfig?.transportSurcharge?.[t] > 0 && (
                        <span className="block text-xs font-normal mt-0.5 opacity-70">
                          +{formatCurrency(trip.priceConfig.transportSurcharge[t])}/pp
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Extras */}
            {Object.keys(trip.availableExtras || {}).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <PackagePlus className="h-4 w-4 text-indigo-600" /> Optional Extras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(trip.availableExtras).map(([extra, price]) => {
                      const selected = config.selectedExtras.includes(extra)
                      return (
                        <button
                          key={extra}
                          onClick={() => toggleExtra(extra)}
                          className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors cursor-pointer text-left ${
                            selected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          <span className={`font-medium ${selected ? 'text-indigo-700' : 'text-slate-700'}`}>{extra}</span>
                          <span className={`text-xs font-medium ml-2 flex-shrink-0 ${selected ? 'text-indigo-600' : 'text-slate-500'}`}>
                            +{formatCurrency(price as number)}/student
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={config.notes}
                  onChange={(e) => setConfig({ ...config, notes: e.target.value })}
                  placeholder="Any specific requirements, dietary needs, accessibility needs..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                  aria-label="Additional notes"
                />
              </CardContent>
            </Card>
          </div>

          {/* Quote panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Card className="border-indigo-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-indigo-600" /> Live Quote
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!config.startDate ? (
                    <p className="text-sm text-slate-500">Select a start date to see your quote.</p>
                  ) : quoteLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                    </div>
                  ) : quote ? (
                    <>
                      <div className="space-y-2 text-sm">
                        {[
                          { label: `Students (${config.students})`, value: quote.baseStudents },
                          { label: `Adults (${config.adults})`, value: quote.baseAdults },
                          { label: 'Meals', value: quote.meals },
                          { label: 'Transport', value: quote.transport },
                          { label: 'Extras', value: quote.extras },
                        ].filter((r) => r.value > 0).map(({ label, value }) => (
                          <div key={label} className="flex justify-between text-slate-600">
                            <span>{label}</span>
                            <span>{formatCurrency(value)}</span>
                          </div>
                        ))}
                        {quote.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-{formatCurrency(quote.discount)}</span>
                          </div>
                        )}
                      </div>
                      <div className="border-t pt-3 space-y-1">
                        <div className="flex justify-between font-bold text-slate-900">
                          <span>Total</span>
                          <span className="text-lg text-indigo-600">{formatCurrency(quote.total)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                          <span>Per student</span>
                          <span>{formatCurrency(quote.perStudent)}</span>
                        </div>
                      </div>
                      {quote.appliedRules?.length > 0 && (
                        <div className="bg-green-50 rounded-md p-2.5 text-xs text-green-700">
                          Discounts applied: {quote.appliedRules.join(', ')}
                        </div>
                      )}
                    </>
                  ) : null}
                </CardContent>
              </Card>

              <Button
                onClick={handleSubmit}
                disabled={!quote || !config.startDate || submitting}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</>
                ) : (
                  <>Request Booking <ChevronRight className="h-4 w-4 ml-1" /></>
                )}
              </Button>

              <p className="text-xs text-center text-slate-500">
                No payment required. Our team will review and contact you within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function TripBuilderPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    }>
      <TripBuilderContent />
    </Suspense>
  )
}
