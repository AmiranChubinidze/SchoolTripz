'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { analyticsApi } from '@/lib/api'
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { BookOpen, Users, TrendingUp, Clock, ArrowRight, Loader2 } from 'lucide-react'

// ─── Count-up hook ───────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1100) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number>()

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    const start = performance.now()

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * ease))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return count
}

// ─── KPI card (spotlight + count-up) ────────────────────────────────────────
interface KpiCardProps {
  label: string
  value: number
  icon: React.ElementType
  accent: string
  prefix?: string
}

function KpiCard({ label, value, icon: Icon, accent, prefix = '' }: KpiCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const animated = useCountUp(Math.round(value))

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`)
    el.style.setProperty('--my', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className="spotlight-card rounded-xl p-5 cursor-default"
      style={{ background: '#141F35', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-between mb-5">
        <span
          className="text-[10px] font-semibold tracking-[0.15em] uppercase"
          style={{ color: '#6B7A96' }}
        >
          {label}
        </span>
        <div
          className="h-7 w-7 rounded-md flex items-center justify-center"
          style={{ background: `${accent}1A` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden="true" />
        </div>
      </div>
      <div className="stat-number text-5xl text-white">
        {prefix}{animated.toLocaleString()}
      </div>
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface Stats {
  overview: {
    totalBookings: number
    pendingBookings: number
    confirmedBookings: number
    totalUsers: number
    totalTrips: number
    totalRevenue: number
  }
  recentBookings: any[]
  popularTrips: any[]
  bookingsByStatus: Record<string, number>
  monthlyRevenue: any[]
}

const MUTED = '#6B7A96'

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.dashboard()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const monthlyData = stats?.monthlyRevenue?.map((m) => ({
    name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short' }),
    revenue: m.revenue,
  })) || []

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: '#7C3AED' }} />
        </div>
      </AdminLayout>
    )
  }

  const kpis: KpiCardProps[] = [
    { label: 'Total Bookings', value: stats?.overview.totalBookings || 0, icon: BookOpen, accent: '#7C3AED' },
    { label: 'Pending Review', value: stats?.overview.pendingBookings || 0, icon: Clock, accent: '#F59E0B' },
    { label: 'Active Users', value: stats?.overview.totalUsers || 0, icon: Users, accent: '#10B981' },
    { label: 'Revenue', value: Math.round(stats?.overview.totalRevenue || 0), icon: TrendingUp, accent: '#00D9F5', prefix: '₾' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <p
            className="text-[10px] font-semibold tracking-[0.16em] uppercase mb-1"
            style={{ color: '#2E3D56' }}
          >
            Overview
          </p>
          <h1 className="text-lg font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.label} {...kpi} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart — darkest card */}
          <div
            className="lg:col-span-2 rounded-xl p-5"
            style={{ background: '#07090F', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="mb-5">
              <p
                className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-0.5"
                style={{ color: MUTED }}
              >
                Monthly Revenue
              </p>
              <p className="text-sm font-medium text-white">Revenue Trend</p>
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: MUTED }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: MUTED }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₾${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatCurrency(v), 'Revenue']}
                    contentStyle={{
                      background: '#1C2D47',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      fontSize: 12,
                      color: 'white',
                    }}
                    labelStyle={{ color: '#A78BFA', fontSize: 11 }}
                    cursor={{ fill: 'rgba(124,58,237,0.06)' }}
                  />
                  <Bar dataKey="revenue" fill="#7C3AED" radius={[3, 3, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="h-52 flex items-center justify-center text-sm text-center px-6"
                style={{ color: MUTED }}
              >
                No revenue data yet. Confirmed bookings will appear here.
              </div>
            )}
          </div>

          {/* Popular trips */}
          <div
            className="rounded-xl p-5"
            style={{ background: '#141F35', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p
                  className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-0.5"
                  style={{ color: MUTED }}
                >
                  Top Performing
                </p>
                <p className="text-sm font-medium text-white">Popular Trips</p>
              </div>
              <Link
                href="/admin/trips"
                className="text-xs transition-colors"
                style={{ color: '#7C3AED' }}
              >
                View all →
              </Link>
            </div>
            {!stats?.popularTrips?.length ? (
              <p className="text-sm py-4" style={{ color: MUTED }}>No data yet.</p>
            ) : (
              <div className="space-y-3.5">
                {stats.popularTrips.map((t, i) => (
                  <div key={t._id} className="flex items-center gap-3">
                    <span
                      className="stat-number text-xs w-5 flex-shrink-0"
                      style={{ color: '#3D4F6E' }}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">{t.trip?.title}</p>
                      <p className="text-[10px]" style={{ color: MUTED }}>{t.count} bookings</p>
                    </div>
                    <span className="text-xs font-medium" style={{ color: '#A78BFA' }}>
                      {formatCurrency(t.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: '#141F35', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div>
              <p
                className="text-[10px] font-semibold tracking-[0.14em] uppercase mb-0.5"
                style={{ color: MUTED }}
              >
                Incoming
              </p>
              <p className="text-sm font-medium text-white">Recent Bookings</p>
            </div>
            <Link
              href="/admin/bookings"
              className="flex items-center gap-1 text-xs"
              style={{ color: '#7C3AED' }}
            >
              All bookings <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {!stats?.recentBookings?.length ? (
            <div className="px-5 py-14 text-center text-sm" style={{ color: MUTED }}>
              No bookings yet. Bookings will appear here once schools submit requests.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Client', 'Trip', 'Date', 'Status', 'Total'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[10px] font-semibold tracking-[0.12em] uppercase text-left ${i === 4 ? 'text-right' : ''} ${i >= 3 ? 'hidden md:table-cell' : ''}`}
                        style={{ color: MUTED }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map((b) => (
                    <tr
                      key={b._id}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      className="transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-medium text-white">{b.client?.name}</p>
                        <p className="text-[10px]" style={{ color: MUTED }}>{b.client?.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: '#A0B0C8' }}>
                        {b.trip?.title}
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: MUTED }}>
                        {formatDate(b.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className={`status-badge capitalize ${getStatusColor(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3.5 text-right text-xs font-semibold hidden md:table-cell"
                        style={{ color: '#A78BFA' }}
                      >
                        {formatCurrency(b.priceBreakdown?.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
