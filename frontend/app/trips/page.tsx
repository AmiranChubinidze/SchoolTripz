'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PublicNav } from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { tripsApi } from '@/lib/api'
import { MapPin, Clock, Search, Filter, X } from 'lucide-react'

interface Trip {
  _id: string
  title: string
  slug: string
  destination: string
  country: string
  durationDays: number
  images: string[]
  category: string
  tags: string[]
  highlights: string[]
  isFeatured: boolean
  isActive: boolean
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [total, setTotal] = useState(0)

  async function fetchTrips() {
    setLoading(true)
    try {
      const params: any = { limit: 20 }
      if (search) params.search = search
      if (category) params.category = category
      const { data } = await tripsApi.list(params)
      setTrips(data.trips)
      setTotal(data.total)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    tripsApi.categories().then(({ data }) => setCategories(data)).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = setTimeout(fetchTrips, 300)
    return () => clearTimeout(timer)
  }, [search, category])

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Explore School Trips</h1>
          <p className="text-slate-600">Discover curriculum-linked educational experiences across Europe and the Caucasus, for Georgian schools.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search destinations, topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                aria-label="Search trips"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {['', ...categories].map((cat) => (
                <button
                  key={cat || 'all'}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer border ${
                    category === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {cat || 'All'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-600">
            {loading ? 'Loading...' : `${total} trip${total !== 1 ? 's' : ''} found`}
          </p>
          {(search || category) && (
            <button
              onClick={() => { setSearch(''); setCategory('') }}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" /> Clear filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border bg-white">
                <div className="skeleton h-48 w-full" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No trips found</h3>
            <p className="text-slate-600 mb-6">Try different search terms or clear your filters.</p>
            <Button variant="outline" onClick={() => { setSearch(''); setCategory('') }}>Clear filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trips.map((trip) => (
              <Link key={trip._id} href={`/trips/${trip.slug}`} className={`group ${!trip.isActive ? 'opacity-60' : ''}`}>
                <article className="rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full flex flex-col">
                  <div className="relative h-44 bg-slate-200 flex-shrink-0">
                    {trip.images?.[0] ? (
                      <Image
                        src={trip.images[0]}
                        alt={trip.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-slate-200 flex items-center justify-center">
                        <MapPin className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {trip.isFeatured && (
                        <span className="bg-indigo-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">Featured</span>
                      )}
                      {!trip.isActive && (
                        <span className="bg-slate-700/80 text-white text-xs font-medium px-2 py-0.5 rounded-full">Inactive</span>
                      )}
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-white/90 text-slate-700 text-xs font-medium px-2 py-0.5 rounded-full">{trip.category}</span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm leading-snug">{trip.title}</h3>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-auto pt-3 border-t">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" aria-hidden="true" />
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {trip.durationDays} days
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
