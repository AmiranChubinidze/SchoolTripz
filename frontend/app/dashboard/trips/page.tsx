'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { tripsApi } from '@/lib/api'
import { MapPin, Clock, Search, ArrowRight } from 'lucide-react'

interface Trip { _id: string; title: string; slug: string; destination: string; country: string; durationDays: number; images: string[]; category: string; tags: string[]; isFeatured: boolean }

export default function DashboardTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [total, setTotal] = useState(0)

  useEffect(() => {
    tripsApi.categories().then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      const params: any = { limit: 20 }
      if (search) params.search = search
      if (category) params.category = category
      tripsApi.list(params)
        .then(({ data }) => { setTrips(data.trips); setTotal(data.total) })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search, category])

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Browse Trips</h1>
          <p className="text-slate-600 mt-1">Find the perfect educational experience for your school.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
            <Input placeholder="Search destinations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" aria-label="Search trips" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['', ...categories].map((cat) => (
              <button
                key={cat || 'all'}
                onClick={() => setCategory(cat)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer border ${
                  category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {cat || 'All'}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-600">{loading ? 'Loading...' : `${total} trips available`}</p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-white overflow-hidden">
                <div className="skeleton h-44" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <article key={trip._id} className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 overflow-hidden flex flex-col">
                <div className="relative h-44 bg-slate-200">
                  {trip.images?.[0] && (
                    <Image src={trip.images[0]} alt={trip.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className="bg-white/90 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full">{trip.category}</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{trip.title}</h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{trip.destination}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{trip.durationDays} days</span>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <Link href={`/trips/${trip.slug}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">View Details</Button>
                    </Link>
                    <Link href={`/dashboard/builder?tripId=${trip._id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs">
                        Build Quote
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
