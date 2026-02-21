'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { tripsApi, settingsApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { Plus, Search, Edit2, Trash2, MapPin, Clock, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { TripFormModal } from '@/components/admin/TripFormModal'

interface Trip { _id: string; title: string; destination: string; durationDays: number; images: string[]; category: string; isActive: boolean; isFeatured: boolean }

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTrip, setEditTrip] = useState<Trip | null>(null)
  const [showInactiveOnPublic, setShowInactiveOnPublic] = useState(false)
  const [settingsLoading, setSettingsLoading] = useState(false)

  async function fetchTrips() {
    setLoading(true)
    try {
      const params: any = { limit: 50 }
      if (search) params.search = search
      const { data } = await tripsApi.adminList(params)
      setTrips(data.trips)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    settingsApi.get().then(({ data }) => {
      setShowInactiveOnPublic(data.showInactiveTrips === true)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const t = setTimeout(fetchTrips, 300)
    return () => clearTimeout(t)
  }, [search])

  async function toggleActive(trip: Trip) {
    try {
      await tripsApi.update(trip._id, { isActive: !trip.isActive })
      fetchTrips()
      toast({ title: `Trip ${trip.isActive ? 'deactivated' : 'activated'}` })
    } catch { toast({ title: 'Update failed', variant: 'destructive' }) }
  }

  async function toggleInactiveVisibility() {
    const newValue = !showInactiveOnPublic
    setSettingsLoading(true)
    try {
      await settingsApi.set('showInactiveTrips', newValue)
      setShowInactiveOnPublic(newValue)
      toast({
        title: newValue
          ? 'Inactive trips are now visible on the public catalog'
          : 'Inactive trips are now hidden from the public catalog',
      })
    } catch {
      toast({ title: 'Failed to update setting', variant: 'destructive' })
    }
    setSettingsLoading(false)
  }

  function openCreate() { setEditTrip(null); setShowModal(true) }
  function openEdit(trip: Trip) { setEditTrip(trip as any); setShowModal(true) }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Trips</h1>
            <p className="text-slate-600 mt-1">Manage all available destinations.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleInactiveVisibility}
              disabled={settingsLoading}
              title={showInactiveOnPublic ? 'Click to hide inactive trips from public catalog' : 'Click to show inactive trips on public catalog'}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-colors disabled:opacity-60 ${
                showInactiveOnPublic
                  ? 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {settingsLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : showInactiveOnPublic
                  ? <Eye className="h-4 w-4" />
                  : <EyeOff className="h-4 w-4" />
              }
              <span className="hidden sm:inline">
                {showInactiveOnPublic ? 'Inactive visible publicly' : 'Inactive hidden publicly'}
              </span>
            </button>
            <Button onClick={openCreate} size="sm">
              <Plus className="h-4 w-4 mr-1.5" /> Add Trip
            </Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" aria-hidden="true" />
          <Input placeholder="Search trips..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" aria-label="Search trips" />
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trip</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Destination</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {trips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-14 rounded-md overflow-hidden bg-slate-200 flex-shrink-0">
                          {trip.images?.[0] && (
                            <Image src={trip.images[0]} alt="" width={56} height={40} className="object-cover w-full h-full" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 leading-tight">{trip.title}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3" />{trip.durationDays} days
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="flex items-center gap-1 text-slate-600">
                        <MapPin className="h-3.5 w-3.5" />{trip.destination}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-600">{trip.category}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {trip.isActive
                          ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" />Active</span>
                          : <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full"><XCircle className="h-3 w-3" />Inactive</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(trip)} className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer" aria-label="Edit trip">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => toggleActive(trip)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer" aria-label={trip.isActive ? 'Deactivate trip' : 'Activate trip'}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {trips.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-sm">No trips found</div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <TripFormModal
          trip={editTrip as any}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchTrips() }}
        />
      )}
    </AdminLayout>
  )
}
