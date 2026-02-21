'use client'
import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { tripsApi, availApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import { CalendarDays, Plus, Save, Loader2 } from 'lucide-react'

interface Trip { _id: string; title: string; destination: string }
interface Availability { _id: string; date: string; totalCapacity: number; bookedCount: number; isAvailable: boolean }

export default function AdminAvailabilityPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [selectedTrip, setSelectedTrip] = useState('')
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newCapacity, setNewCapacity] = useState(30)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    tripsApi.adminList({ limit: 50 }).then(({ data }) => setTrips(data.trips)).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedTrip) return
    setLoading(true)
    availApi.forTrip(selectedTrip)
      .then(({ data }) => setAvailability(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [selectedTrip])

  async function addDate() {
    if (!newDate || !selectedTrip) return
    setSaving(true)
    try {
      await availApi.upsert(selectedTrip, { date: newDate, capacity: newCapacity })
      toast({ title: 'Availability saved' })
      setNewDate('')
      // Refresh
      const { data } = await availApi.forTrip(selectedTrip)
      setAvailability(data)
    } catch { toast({ title: 'Save failed', variant: 'destructive' }) }
    setSaving(false)
  }

  async function updateCapacity(date: string, capacity: number) {
    if (!selectedTrip) return
    try {
      await availApi.upsert(selectedTrip, { date, capacity })
      toast({ title: 'Updated' })
    } catch { toast({ title: 'Update failed', variant: 'destructive' }) }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Availability Management</h1>
          <p className="text-slate-600 mt-1">Set capacity for trip dates.</p>
        </div>

        {/* Trip selector */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Select Trip</CardTitle></CardHeader>
          <CardContent>
            <Select value={selectedTrip} onValueChange={setSelectedTrip}>
              <SelectTrigger className="max-w-sm" aria-label="Select a trip">
                <SelectValue placeholder="Choose a trip to manage availability..." />
              </SelectTrigger>
              <SelectContent>
                {trips.map((t) => (
                  <SelectItem key={t._id} value={t._id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedTrip && (
          <>
            {/* Add new date */}
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Plus className="h-4 w-4 text-indigo-600" />Add Date</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3 items-end">
                  <div className="space-y-1.5">
                    <Label htmlFor="avail-date">Date</Label>
                    <Input id="avail-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-44" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="avail-cap">Max Capacity</Label>
                    <Input id="avail-cap" type="number" min={1} value={newCapacity} onChange={(e) => setNewCapacity(+e.target.value)} className="w-28" />
                  </div>
                  <Button onClick={addDate} disabled={saving || !newDate} size="sm">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing dates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-indigo-600" />
                  Available Dates ({availability.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>
                ) : availability.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No dates configured yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b">
                        <tr>
                          <th className="text-left py-2 pr-4 text-xs text-slate-500 font-semibold">Date</th>
                          <th className="text-left py-2 pr-4 text-xs text-slate-500 font-semibold">Capacity</th>
                          <th className="text-left py-2 pr-4 text-xs text-slate-500 font-semibold">Booked</th>
                          <th className="text-left py-2 text-xs text-slate-500 font-semibold">Available</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {availability.map((slot) => {
                          const remaining = slot.totalCapacity - slot.bookedCount
                          return (
                            <tr key={slot._id} className="hover:bg-slate-50">
                              <td className="py-3 pr-4 font-medium text-slate-900">{formatDate(slot.date)}</td>
                              <td className="py-3 pr-4">
                                <Input
                                  type="number" min={slot.bookedCount}
                                  defaultValue={slot.totalCapacity}
                                  className="w-24 h-8 text-xs"
                                  onBlur={(e) => updateCapacity(slot.date, +e.target.value)}
                                  aria-label={`Capacity for ${formatDate(slot.date)}`}
                                />
                              </td>
                              <td className="py-3 pr-4 text-slate-600">{slot.bookedCount}</td>
                              <td className="py-3">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${remaining > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                  {remaining > 0 ? `${remaining} spots` : 'Full'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
