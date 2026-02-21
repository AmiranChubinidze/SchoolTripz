'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { analyticsApi } from '@/lib/api'
import { formatCurrency, getStatusColor } from '@/lib/utils'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts'
import { Loader2, TrendingUp, BookOpen, Users, MapPin } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b', approved: '#3b82f6', confirmed: '#22c55e',
  cancelled: '#94a3b8', rejected: '#ef4444',
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsApi.dashboard()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div></AdminLayout>

  const monthlyData = stats?.monthlyRevenue?.map((m: any) => ({
    name: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
    revenue: m.revenue,
    bookings: m.bookings,
  })) || []

  const statusPieData = Object.entries(stats?.bookingsByStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count as number,
    color: STATUS_COLORS[status] || '#94a3b8',
  }))

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-600 mt-1">Platform performance and booking metrics.</p>
        </div>

        {/* Overview KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Bookings', value: stats?.overview.totalBookings, icon: BookOpen, color: 'indigo' },
            { label: 'Confirmed', value: stats?.overview.confirmedBookings, icon: TrendingUp, color: 'green' },
            { label: 'Total Users', value: stats?.overview.totalUsers, icon: Users, color: 'blue' },
            { label: 'Active Trips', value: stats?.overview.totalTrips, icon: MapPin, color: 'purple' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-5">
                <div className={`h-9 w-9 rounded-lg bg-${color}-100 flex items-center justify-center mb-3`}>
                  <Icon className={`h-4 w-4 text-${color}-600`} aria-hidden="true" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{value || 0}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly revenue */}
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Revenue</CardTitle></CardHeader>
            <CardContent>
              {monthlyData.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₾${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), 'Revenue']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="h-60 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
            </CardContent>
          </Card>

          {/* Booking trend */}
          <Card>
            <CardHeader><CardTitle className="text-base">Monthly Bookings</CardTitle></CardHeader>
            <CardContent>
              {monthlyData.length ? (
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                    <Line type="monotone" dataKey="bookings" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div className="h-60 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status distribution */}
          <Card>
            <CardHeader><CardTitle className="text-base">Bookings by Status</CardTitle></CardHeader>
            <CardContent>
              {statusPieData.length ? (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={180} height={180}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                        {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2">
                    {statusPieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-sm">
                        <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} aria-hidden="true" />
                        <span className="text-slate-600">{entry.name}</span>
                        <span className="font-medium text-slate-900 ml-auto">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
            </CardContent>
          </Card>

          {/* Popular trips */}
          <Card>
            <CardHeader><CardTitle className="text-base">Top Trips by Bookings</CardTitle></CardHeader>
            <CardContent>
              {stats?.popularTrips?.length ? (
                <div className="space-y-3">
                  {stats.popularTrips.map((t: any, i: number) => (
                    <div key={t._id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-300 w-5">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{t.trip?.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <div className="h-1.5 rounded-full bg-indigo-200 flex-1 max-w-[120px]">
                            <div
                              className="h-1.5 rounded-full bg-indigo-600"
                              style={{ width: `${(t.count / (stats.popularTrips[0]?.count || 1)) * 100}%` }}
                              aria-hidden="true"
                            />
                          </div>
                          <span className="text-xs text-slate-500">{t.count} bookings</span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{formatCurrency(t.revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : <div className="h-44 flex items-center justify-center text-slate-400 text-sm">No data yet</div>}
            </CardContent>
          </Card>
        </div>

        {/* Revenue highlight */}
        <Card className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm">Total Platform Revenue</p>
              <p className="text-4xl font-bold mt-1">{formatCurrency(stats?.overview.totalRevenue || 0)}</p>
              <p className="text-indigo-200 text-xs mt-1">From approved & confirmed bookings</p>
            </div>
            <TrendingUp className="h-16 w-16 text-indigo-300 opacity-50" aria-hidden="true" />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
