'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { PublicNav } from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { tripsApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import {
  MapPin, Clock, Users, Check, X as XIcon, ArrowLeft, Lock, ChevronLeft, ChevronRight,
} from 'lucide-react'

interface Trip {
  _id: string; title: string; slug: string; description: string
  destination: string; country: string; durationDays: number
  images: string[]; highlights: string[]; includedItems: string[]
  excludedItems: string[]; category: string; tags: string[]
  minStudents: number; maxStudents: number
}

export default function TripDetailPage() {
  const { slug } = useParams()
  const { user } = useAuthStore()
  const router = useRouter()
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    tripsApi.bySlug(slug as string)
      .then(({ data }) => setTrip(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNav />
        <div className="max-w-4xl mx-auto px-4 py-16 space-y-4">
          <div className="skeleton h-8 w-64" />
          <div className="skeleton h-72 w-full rounded-xl" />
          <div className="skeleton h-4 w-full" />
          <div className="skeleton h-4 w-3/4" />
        </div>
      </div>
    )
  }

  if (notFound || !trip) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PublicNav />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Trip not found</h1>
          <Link href="/trips"><Button variant="outline" className="mt-4">Browse All Trips</Button></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
          <Link href="/trips" className="flex items-center gap-1 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            All Trips
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium truncate">{trip.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            {trip.images.length > 0 && (
              <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden bg-slate-200">
                <Image
                  src={trip.images[imgIdx]}
                  alt={`${trip.title} - photo ${imgIdx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  priority
                />
                {trip.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + trip.images.length) % trip.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % trip.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                      {trip.images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIdx(i)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${i === imgIdx ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Title + meta */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary">{trip.category}</Badge>
                {trip.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">{trip.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  {trip.destination}, {trip.country}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  {trip.durationDays} days
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-indigo-500" aria-hidden="true" />
                  {trip.minStudents}–{trip.maxStudents} students
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">{trip.description}</p>
            </div>

            {/* Highlights */}
            {trip.highlights.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Trip Highlights</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {trip.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Included / Excluded */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <section>
                <h2 className="text-base font-semibold text-slate-900 mb-3">What's included</h2>
                <ul className="space-y-1.5">
                  {trip.includedItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section>
                <h2 className="text-base font-semibold text-slate-900 mb-3">Not included</h2>
                <ul className="space-y-1.5">
                  {trip.excludedItems.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <XIcon className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Right: CTA card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl overflow-hidden border border-black/[0.08] shadow-sm bg-white">
              {user ? (
                <>
                  {/* Branded header strip */}
                  <div
                    className="px-6 pt-6 pb-5"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(0,217,245,0.05) 100%)', borderBottom: '1px solid rgba(124,58,237,0.1)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: '#7C3AED' }}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: '#7C3AED' }}>
                        Live Pricing
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 text-sm leading-snug mb-3">{trip.title}</p>
                    <div className="flex flex-wrap gap-3">
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3 w-3 text-slate-400" aria-hidden="true" />
                        {trip.durationDays} days
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 text-slate-400" aria-hidden="true" />
                        {trip.destination}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Users className="h-3 w-3 text-slate-400" aria-hidden="true" />
                        {trip.minStudents}–{trip.maxStudents} students
                      </span>
                    </div>
                  </div>

                  {/* CTA body */}
                  <div className="px-6 pt-5 pb-4">
                    <p className="text-xs text-slate-400 text-center mb-4">
                      Choose dates, group size & extras to see your price
                    </p>
                    <Link href={`/dashboard/builder?tripId=${trip._id}`}>
                      <Button className="w-full" size="lg">Build My Quote</Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-6 space-y-4">
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-slate-300 mx-auto mb-3" aria-hidden="true" />
                    <h3 className="font-semibold text-slate-900 mb-1">Pricing available after sign-in</h3>
                    <p className="text-sm text-slate-500">
                      Create a free account to access our live price builder and request a booking.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link href={`/register?redirect=/dashboard/builder?tripId=${trip._id}`}>
                      <Button className="w-full" size="lg">Create Free Account</Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline" className="w-full">Sign In</Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Trust signals — always visible */}
              <div className="px-6 pb-5 pt-1 border-t border-black/[0.05] space-y-2.5">
                {[
                  'No payment required to enquire',
                  'Personalised quote in minutes',
                  'Expert team review within 24h',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-slate-500">
                    <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" aria-hidden="true" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
