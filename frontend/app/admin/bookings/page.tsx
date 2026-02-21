'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { bookingsApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { MapPin, Clock, Users, ChevronRight, Loader2, RefreshCw } from 'lucide-react'

interface Booking {
  _id: string
  status: string
  createdAt: string
  trip: { title: string; destination: string }
  client: { name: string; email: string; school: string }
  config: { students: number; startDate: string }
  priceBreakdown: { total: number }
}

type KanbanData = Record<string, Booking[]>

// ─── ClickSpark component ────────────────────────────────────────────────────
interface Spark {
  id: number
  x: number
  y: number
  dx: number
  dy: number
}

function ClickSpark({
  children,
  color = '#A3E635',
  disabled = false,
}: {
  children: React.ReactNode
  color?: string
  disabled?: boolean
}) {
  const [sparks, setSparks] = useState<Spark[]>([])
  const nextId = useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newSparks: Spark[] = Array.from({ length: 8 }, (_, i) => {
      const angle = (i * 45) * (Math.PI / 180)
      const dist = 28 + Math.random() * 22
      return {
        id: nextId.current++,
        x,
        y,
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
      }
    })

    setSparks((prev) => [...prev, ...newSparks])
    setTimeout(() => {
      const ids = new Set(newSparks.map((s) => s.id))
      setSparks((prev) => prev.filter((s) => !ids.has(s.id)))
    }, 600)
  }

  return (
    <div className="relative inline-flex" onClick={handleClick} style={{ userSelect: 'none' }}>
      {children}
      {sparks.map(({ id, x, y, dx, dy }) => (
        <span
          key={id}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: color,
            ['--dx' as string]: `${dx}px`,
            ['--dy' as string]: `${dy}px`,
            animation: 'clickSpark 0.55s ease-out forwards',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        />
      ))}
    </div>
  )
}

// ─── Column config ───────────────────────────────────────────────────────────
const COLUMNS = [
  { key: 'pending', label: 'Pending', isPrimary: true },
  { key: 'approved', label: 'Approved', isPrimary: false },
  { key: 'confirmed', label: 'Confirmed', isPrimary: false },
  { key: 'rejected', label: 'Rejected', isPrimary: false },
  { key: 'cancelled', label: 'Cancelled', isPrimary: false },
]

const MUTED = '#6B7A96'

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminBookingsPage() {
  const [kanban, setKanban] = useState<KanbanData>({})
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  async function fetchKanban() {
    setLoading(true)
    try {
      const { data } = await bookingsApi.kanban()
      setKanban(data)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchKanban() }, [])

  async function approve(bookingId: string) {
    setActionId(bookingId)
    try {
      await bookingsApi.updateStatus(bookingId, 'approved')
      toast({ title: 'Booking approved' })
      fetchKanban()
    } catch {
      toast({ title: 'Failed to approve', variant: 'destructive' })
    }
    setActionId(null)
  }

  async function reject(bookingId: string) {
    const notes = prompt('Reason for rejection (optional):') ?? ''
    setActionId(bookingId)
    try {
      await bookingsApi.updateStatus(bookingId, 'rejected', notes)
      toast({ title: 'Booking rejected' })
      fetchKanban()
    } catch {
      toast({ title: 'Failed to reject', variant: 'destructive' })
    }
    setActionId(null)
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-semibold tracking-[0.16em] uppercase mb-1"
              style={{ color: '#2E3D56' }}
            >
              Operations
            </p>
            <h1 className="text-lg font-bold text-white">Bookings Pipeline</h1>
          </div>
          <button
            onClick={fetchKanban}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-40"
            style={{ background: '#141F35', border: '1px solid rgba(255,255,255,0.08)', color: MUTED }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = MUTED)}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-7 w-7 animate-spin" style={{ color: '#7C3AED' }} />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(({ key, label, isPrimary }) => {
              const items = kanban[key] || []
              return (
                <div key={key} className="flex-shrink-0 w-72">
                  {/* Column header */}
                  <div
                    className="rounded-lg px-3.5 py-2.5 flex items-center justify-between mb-2.5"
                    style={
                      isPrimary
                        ? {
                            background: '#07090F',
                            borderLeft: '2px solid #7C3AED',
                            boxShadow: '-4px 0 20px rgba(124,58,237,0.18)',
                            paddingLeft: '12px',
                          }
                        : {
                            background: '#141F35',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }
                    }
                  >
                    <span
                      className="text-xs font-semibold tracking-wide"
                      style={{ color: isPrimary ? 'white' : MUTED }}
                    >
                      {label}
                    </span>
                    <span
                      className="stat-number text-sm"
                      style={{ color: isPrimary ? '#A78BFA' : '#3D4F6E' }}
                    >
                      {items.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2.5 min-h-24">
                    {items.length === 0 ? (
                      <div
                        className="rounded-lg px-4 py-8 text-center text-xs"
                        style={{
                          border: '1px dashed rgba(255,255,255,0.08)',
                          color: '#3D4F6E',
                        }}
                      >
                        No bookings
                      </div>
                    ) : (
                      items.map((booking) => (
                        <div
                          key={booking._id}
                          className="rounded-lg p-3.5 transition-all duration-150 hover:-translate-y-px"
                          style={{
                            background: '#1C2D47',
                            border: isPrimary
                              ? '1px solid rgba(124,58,237,0.2)'
                              : '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          {/* Card header */}
                          <div className="flex items-start justify-between gap-1 mb-2">
                            <p className="text-xs font-semibold text-white leading-snug line-clamp-2 flex-1">
                              {booking.trip?.title}
                            </p>
                            <Link
                              href={`/admin/bookings/${booking._id}`}
                              className="flex-shrink-0 ml-1 transition-colors"
                              style={{ color: '#3D4F6E' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#A78BFA')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#3D4F6E')}
                            >
                              <ChevronRight className="h-3.5 w-3.5" aria-label="View details" />
                            </Link>
                          </div>

                          {/* Client */}
                          <p className="text-xs font-medium mb-0.5" style={{ color: '#A0B0C8' }}>
                            {booking.client?.name}
                          </p>
                          {booking.client?.school && (
                            <p className="text-[10px] mb-2.5" style={{ color: MUTED }}>
                              {booking.client.school}
                            </p>
                          )}

                          {/* Meta */}
                          <div className="space-y-1 text-[10px]" style={{ color: MUTED }}>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              {booking.trip?.destination}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3 w-3 flex-shrink-0" />
                              {booking.config?.startDate ? formatDate(booking.config.startDate) : '—'}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3 w-3 flex-shrink-0" />
                              {booking.config?.students} students
                            </div>
                          </div>

                          {/* Footer */}
                          <div
                            className="mt-3 pt-3 flex items-center justify-between"
                            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            <span className="text-xs font-bold" style={{ color: '#A78BFA' }}>
                              {formatCurrency(booking.priceBreakdown?.total)}
                            </span>

                            {key === 'pending' && (
                              <div className="flex gap-1.5">
                                <ClickSpark color="#A3E635" disabled={actionId === booking._id}>
                                  <button
                                    onClick={() => approve(booking._id)}
                                    disabled={actionId === booking._id}
                                    className="text-[11px] px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-opacity disabled:opacity-40"
                                    style={{ background: '#A3E635', color: '#0A0F00' }}
                                  >
                                    {actionId === booking._id ? '…' : 'Approve'}
                                  </button>
                                </ClickSpark>
                                <button
                                  onClick={() => reject(booking._id)}
                                  disabled={actionId === booking._id}
                                  className="text-[11px] px-2.5 py-1 rounded-md font-semibold cursor-pointer transition-opacity disabled:opacity-40"
                                  style={{
                                    border: '1px solid rgba(239,68,68,0.5)',
                                    color: '#F87171',
                                    background: 'transparent',
                                  }}
                                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
