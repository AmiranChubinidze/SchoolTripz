'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { PublicNav } from '@/components/layout/PublicNav'
import { Button } from '@/components/ui/button'
import { GradientText } from '@/components/ui/gradient-text'
import { CountUp } from '@/components/ui/count-up'
import { SpotlightCard } from '@/components/ui/spotlight-card'
import { LightRays } from '@/components/ui/light-rays'
import { GradualBlur } from '@/components/ui/gradual-blur'
import { ClickSpark } from '@/components/ui/click-spark'
import { useAuthStore } from '@/lib/store'
import { tripsApi } from '@/lib/api'
import {
  MapPin, Clock, Shield, BookOpen, Calculator, ArrowRight,
  CheckCircle, Layers, UserCheck, ChevronRight,
} from 'lucide-react'

interface TripCard {
  _id: string; slug: string; title: string; description: string
  images: string[]; category: string; tags: string[]; durationDays: number
  destination: string; country: string; highlights: string[]
}

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    pain: 'Stop juggling emails and spreadsheets',
    relief: 'One place for quotes, requests, and approvals. Nothing slips.',
    icon: Layers,
  },
  {
    pain: 'Know the price before you commit',
    relief: 'Build your quote live. Students, meals, transport, extras — all visible upfront.',
    icon: Calculator,
  },
  {
    pain: 'Every booking reviewed by a real person',
    relief: 'No auto-confirmations. Our team checks every booking, every time.',
    icon: UserCheck,
  },
  {
    pain: 'Trips built for the curriculum, not tourism',
    relief: 'Subject tags, learning outcomes, and exam-board links on every destination.',
    icon: BookOpen,
  },
]

const steps = [
  { num: '01', title: 'Browse Trips', desc: 'Explore curriculum-linked destinations across Europe and the Caucasus.' },
  { num: '02', title: 'Build Your Trip', desc: 'Configure students, dates, meals, transport, and extras.' },
  { num: '03', title: 'Submit', desc: 'Send your request in seconds. No forms, no phone calls.' },
  { num: '04', title: 'Reviewed by Team', desc: 'A real person checks every booking within 24 hours.' },
  { num: '05', title: 'Confirm & Go', desc: "Approve the quote and you're done. That simple." },
]

const trustSignals = [
  { icon: Shield, text: 'Reviewed by real humans' },
  { icon: CheckCircle, text: 'No auto-billing' },
  { icon: MapPin, text: 'Georgia-based support' },
  { icon: Clock, text: '24h approval target' },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { user } = useAuthStore()
  const planHref = user ? '/dashboard/trips' : '/register'
  const [destinations, setDestinations] = useState<TripCard[]>([])

  useEffect(() => {
    tripsApi.list({ limit: 4 })
      .then(({ data }) => setDestinations(data.trips))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F4F0' }}>
      <PublicNav />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: '#080E1A' }}>
        <LightRays />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:pt-24 md:pb-32">
          <div className="max-w-3xl">
            {/* Trust pill */}
            <GradualBlur delay={0}>
              <div className="inline-flex items-center gap-2 mb-8 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 font-medium tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse-glow" aria-hidden="true" />
                Trusted by 200+ Georgian schools
              </div>
            </GradualBlur>

            {/* Headline */}
            <GradualBlur delay={120}>
              <h1
                className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6"
                style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', lineHeight: '1.05', letterSpacing: '-0.03em' }}
              >
                Plan school trips<br />
                without the{' '}
                <GradientText>chaos.</GradientText>
              </h1>
            </GradualBlur>

            {/* Subtext */}
            <GradualBlur delay={220}>
              <p className="text-lg text-white/50 mb-10 max-w-xl leading-relaxed">
                Quotes built in minutes. Reviewed by humans. Approved fast.
              </p>
            </GradualBlur>

            {/* CTAs */}
            <GradualBlur delay={320}>
              <ClickSpark className="inline-flex flex-col sm:flex-row gap-3">
                <Link href={planHref}>
                  <Button size="lg" className="gap-2">
                    Start Planning
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Link href="/#how-it-works">
                  <Button variant="outline-white" size="lg">
                    See How It Works
                  </Button>
                </Link>
              </ClickSpark>
            </GradualBlur>

            {/* Inline trust */}
            <GradualBlur delay={420}>
              <div className="mt-10 flex flex-wrap items-center gap-5">
                {trustSignals.map(({ icon: Icon, text }) => (
                  <span key={text} className="flex items-center gap-1.5 text-xs text-white/35">
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {text}
                  </span>
                ))}
              </div>
            </GradualBlur>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F5F4F0' }} className="border-b border-black/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-black/[0.06]">
            {[
              { end: 200, suffix: '+', label: 'Schools Served' },
              { end: 5000, suffix: '+', label: 'Students Traveled' },
              { end: 40, suffix: '+', label: 'Destinations' },
              { end: 24, suffix: 'h', label: 'Approval Target' },
            ].map(({ end, suffix, label }) => (
              <div key={label} className="text-center md:px-8">
                <dt
                  className="text-4xl font-bold"
                  style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', color: '#7C3AED' }}
                >
                  <CountUp end={end} suffix={suffix} />
                </dt>
                <dd className="text-sm text-black/45 mt-1 font-medium">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section style={{ backgroundColor: '#080E1A' }} className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GradualBlur>
            <div className="mb-16 max-w-xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-400 mb-4">
                Why teachers switch
              </p>
              <h2
                className="text-4xl md:text-5xl font-bold text-white"
                style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', lineHeight: '1.1', letterSpacing: '-0.025em' }}
              >
                Why teachers switch<br />to SchoolTripz
              </h2>
            </div>
          </GradualBlur>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(({ pain, relief, icon: Icon }, i) => (
              <GradualBlur key={pain} delay={i * 80}>
                <SpotlightCard
                  className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-8 h-full"
                  glowColor="rgba(124, 58, 237, 0.18)"
                >
                  <div className="flex items-start gap-5">
                    <div
                      className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(124,58,237,0.15)' }}
                    >
                      <Icon className="h-5 w-5 text-brand-400" aria-hidden="true" />
                    </div>
                    <div>
                      <h3
                        className="text-base font-bold text-white mb-2"
                        style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
                      >
                        {pain}
                      </h3>
                      <p className="text-sm text-white/45 leading-relaxed">{relief}</p>
                    </div>
                  </div>
                </SpotlightCard>
              </GradualBlur>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ─────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F5F4F0' }} className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GradualBlur>
            <div className="flex items-end justify-between mb-14">
              <div className="max-w-lg">
                <p className="text-xs font-semibold tracking-widest uppercase text-brand-600 mb-3">
                  Destinations
                </p>
                <h2
                  className="text-4xl md:text-5xl font-bold text-ink"
                  style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', lineHeight: '1.1', letterSpacing: '-0.025em' }}
                >
                  Destinations with purpose.
                </h2>
              </div>
              <Link
                href="/trips"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
              >
                View all
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </GradualBlur>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {destinations.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden bg-white border border-black/[0.06] h-64 animate-pulse">
                    <div className="h-44 bg-slate-200" />
                    <div className="p-5 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))
              : destinations.map((dest, i) => (
                  <GradualBlur key={dest.slug} delay={i * 70}>
                    <Link href={`/trips/${dest.slug}`} className="group block h-full">
                      <article className="rounded-xl overflow-hidden bg-white border border-black/[0.06] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                        <div className="relative h-44 bg-slate-200 overflow-hidden">
                          {dest.images[0] && (
                            <Image
                              src={dest.images[0]}
                              alt={dest.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <span className="tag-subject">{dest.category}</span>
                          </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3
                            className="font-bold text-ink mb-1.5 text-base"
                            style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
                          >
                            {dest.title}
                          </h3>
                          <p className="text-xs text-black/50 leading-relaxed mb-4 flex-1">
                            {dest.highlights[0] || dest.description.slice(0, 80)}
                          </p>
                          <div className="flex items-center justify-between text-xs text-black/35 pt-3 border-t border-black/[0.06]">
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" aria-hidden="true" />
                              {dest.tags.slice(0, 2).join(' · ') || dest.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" aria-hidden="true" />
                              {dest.durationDays} days
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  </GradualBlur>
                ))
            }
          </div>

          <div className="mt-10 text-center sm:hidden">
            <Link href="/trips">
              <Button variant="outline" size="lg">View All Trips</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" style={{ backgroundColor: '#080E1A' }} className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GradualBlur>
            <div className="mb-16 max-w-xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-brand-400 mb-4">
                Process
              </p>
              <h2
                className="text-4xl md:text-5xl font-bold text-white"
                style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', lineHeight: '1.1', letterSpacing: '-0.025em' }}
              >
                Five steps.<br />Zero surprises.
              </h2>
            </div>
          </GradualBlur>

          <div className="relative">
            {/* Connector line */}
            <div
              className="hidden lg:block absolute top-6 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(to right, transparent 5%, rgba(124,58,237,0.4) 30%, rgba(0,217,245,0.3) 70%, transparent 95%)' }}
              aria-hidden="true"
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-4">
              {steps.map(({ num, title, desc }, i) => (
                <GradualBlur key={num} delay={i * 100}>
                  <div className="relative flex flex-col items-start lg:items-center lg:text-center">
                    <div
                      className="relative z-10 h-12 w-12 rounded-full flex items-center justify-center text-xs font-bold mb-5 flex-shrink-0 border"
                      style={{
                        background: i === 0 ? 'linear-gradient(135deg, #7C3AED, #00D9F5)' : 'rgba(255,255,255,0.04)',
                        borderColor: i === 0 ? 'transparent' : 'rgba(255,255,255,0.08)',
                        color: i === 0 ? '#fff' : 'rgba(255,255,255,0.4)',
                        fontFamily: '"Space Grotesk", Inter, sans-serif',
                      }}
                    >
                      {num}
                    </div>
                    <h3
                      className="font-bold text-white text-sm mb-2"
                      style={{ fontFamily: '"Space Grotesk", Inter, sans-serif' }}
                    >
                      {title}
                    </h3>
                    <p className="text-xs text-white/38 leading-relaxed max-w-[180px] lg:max-w-none">
                      {desc}
                    </p>
                  </div>
                </GradualBlur>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST + CTA ──────────────────────────────────────── */}
      <section style={{ backgroundColor: '#F5F4F0' }} className="py-24 md:py-32 border-t border-black/[0.06]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <GradualBlur>
            <div className="flex flex-wrap items-center justify-center gap-6 mb-14">
              {trustSignals.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-sm text-black/40 font-medium">
                  <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                  {text}
                </span>
              ))}
            </div>

            <h2
              className="text-4xl md:text-5xl font-bold text-ink mb-5"
              style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', lineHeight: '1.1', letterSpacing: '-0.025em' }}
            >
              Start planning your<br />next school trip.
            </h2>
            <p className="text-base text-black/45 mb-10 max-w-md mx-auto">
              Join 200+ Georgian schools. Free to start. No commitment.
            </p>

            <ClickSpark className="inline-flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={planHref}>
                <Button size="lg" className="gap-2">
                  Start Planning
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </Link>
              <Link href="/trips">
                <Button variant="outline" size="lg">Browse Trips First</Button>
              </Link>
            </ClickSpark>
          </GradualBlur>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer style={{ backgroundColor: '#080E1A' }} className="border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <span
              className="text-lg font-bold text-white"
              style={{ fontFamily: '"Space Grotesk", Inter, sans-serif', letterSpacing: '-0.02em' }}
            >
              School<span className="gradient-text-static">Tripz</span>
            </span>
            <nav className="flex flex-wrap gap-6 text-sm" aria-label="Footer navigation">
              <Link href="/trips" className="text-white/35 hover:text-white/70 transition-colors">Browse Trips</Link>
              <Link href="/login" className="text-white/35 hover:text-white/70 transition-colors">Sign In</Link>
              <Link href="/register" className="text-white/35 hover:text-white/70 transition-colors">Register</Link>
            </nav>
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} SchoolTripz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
