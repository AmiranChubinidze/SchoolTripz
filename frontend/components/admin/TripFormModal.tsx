'use client'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { tripsApi, uploadsApi } from '@/lib/api'
import { toast } from '@/hooks/use-toast'
import { X, Loader2, Upload, Link2, ImagePlus } from 'lucide-react'

interface Trip {
  _id?: string; title: string; description: string; destination: string; country: string
  durationDays: number; images: string[]; highlights: string[]; includedItems: string[]
  excludedItems: string[]; category: string; tags: string[]; minStudents: number; maxStudents: number
  priceConfig: { basePerStudent: number; basePerAdult: number; mealPerPersonPerDay: number }
  availableTransport: string[]; availableExtras: Record<string, number>
  isActive: boolean; isFeatured: boolean
}

const DEFAULT_TRIP: Trip = {
  title: '', description: '', destination: '', country: 'Georgia',
  durationDays: 3, images: [], highlights: [], includedItems: [], excludedItems: [],
  category: 'Cultural', tags: [], minStudents: 15, maxStudents: 50,
  priceConfig: { basePerStudent: 50, basePerAdult: 70, mealPerPersonPerDay: 15 },
  availableTransport: ['bus'], availableExtras: {}, isActive: true, isFeatured: false,
}

export function TripFormModal({ trip, onClose, onSaved }: { trip?: Trip; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<Trip>(trip || DEFAULT_TRIP)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function updatePriceConfig(field: string, value: number) {
    setForm((f) => ({ ...f, priceConfig: { ...f.priceConfig, [field]: value } }))
  }

  function updateList(field: string, value: string) {
    update(field, value.split('\n').filter(Boolean))
  }

  function removeImage(index: number) {
    update('images', form.images.filter((_, i) => i !== index))
  }

  function addUrlImage() {
    const url = urlInput.trim()
    if (!url) return
    update('images', [...form.images, url])
    setUrlInput('')
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { data } = await uploadsApi.uploadImage(file)
      update('images', [...form.images, data.url])
      toast({ title: 'Photo uploaded' })
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' })
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSave() {
    if (!form.title.trim()) return toast({ title: 'Title is required', variant: 'destructive' })
    if (!form.destination.trim()) return toast({ title: 'Destination is required', variant: 'destructive' })
    if (!form.description.trim()) return toast({ title: 'Description is required', variant: 'destructive' })
    if (!form.country.trim()) return toast({ title: 'Country is required', variant: 'destructive' })
    setLoading(true)
    try {
      if (trip?._id) {
        await tripsApi.update(trip._id, form)
        toast({ title: 'Trip updated' })
      } else {
        await tripsApi.create(form)
        toast({ title: 'Trip created' })
      }
      onSaved()
    } catch (err: any) {
      toast({ title: err.response?.data?.message || 'Save failed', variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="trip-modal-title">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 id="trip-modal-title" className="text-lg font-bold text-slate-900">{trip?._id ? 'Edit Trip' : 'Create New Trip'}</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-900 cursor-pointer" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="t-title">Title</Label>
              <Input id="t-title" value={form.title} onChange={(e) => update('title', e.target.value)} placeholder="e.g. Discover Paris & Versailles" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-dest">Destination</Label>
              <Input id="t-dest" value={form.destination} onChange={(e) => update('destination', e.target.value)} placeholder="e.g. Paris" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-country">Country</Label>
              <Input id="t-country" value={form.country} onChange={(e) => update('country', e.target.value)} placeholder="e.g. France" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-duration">Duration (days)</Label>
              <Input id="t-duration" type="number" min={1} value={form.durationDays} onChange={(e) => update('durationDays', +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-category">Category</Label>
              <Input id="t-category" value={form.category} onChange={(e) => update('category', e.target.value)} placeholder="e.g. Cultural" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Description</Label>
            <textarea
              id="t-desc"
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              rows={3}
              placeholder="Detailed trip description..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          {/* Pricing */}
          <div className="border rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Pricing (per person per day)</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-student" className="text-xs">Per Student (₾)</Label>
                <Input id="p-student" type="number" min={0} step={0.01} value={form.priceConfig.basePerStudent} onChange={(e) => updatePriceConfig('basePerStudent', +e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-adult" className="text-xs">Per Adult (₾)</Label>
                <Input id="p-adult" type="number" min={0} step={0.01} value={form.priceConfig.basePerAdult} onChange={(e) => updatePriceConfig('basePerAdult', +e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-meal" className="text-xs">Per Meal (₾)</Label>
                <Input id="p-meal" type="number" min={0} step={0.01} value={form.priceConfig.mealPerPersonPerDay} onChange={(e) => updatePriceConfig('mealPerPersonPerDay', +e.target.value)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-min">Min Students</Label>
              <Input id="t-min" type="number" min={1} value={form.minStudents} onChange={(e) => update('minStudents', +e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-max">Max Students</Label>
              <Input id="t-max" type="number" min={1} value={form.maxStudents} onChange={(e) => update('maxStudents', +e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="t-highlights">Highlights (one per line)</Label>
            <textarea
              id="t-highlights"
              value={form.highlights.join('\n')}
              onChange={(e) => updateList('highlights', e.target.value)}
              rows={3}
              placeholder="Eiffel Tower visit&#10;Louvre Museum&#10;Seine cruise"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="t-included">Included (one per line)</Label>
              <textarea id="t-included" value={form.includedItems.join('\n')} onChange={(e) => updateList('includedItems', e.target.value)} rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-excluded">Excluded (one per line)</Label>
              <textarea id="t-excluded" value={form.excludedItems.join('\n')} onChange={(e) => updateList('excludedItems', e.target.value)} rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <Label>Photos</Label>

            {/* Image previews */}
            {form.images.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {form.images.map((url, i) => (
                  <div key={i} className="relative group w-24 h-16 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-full object-cover rounded-md border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                      aria-label={`Remove photo ${i + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-16 border-2 border-dashed border-slate-200 rounded-lg">
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4" />
                  No photos yet — upload or add a URL below
                </p>
              </div>
            )}

            {/* Upload + URL row */}
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {uploading
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</>
                  : <><Upload className="h-4 w-4" />Upload photo</>
                }
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="sr-only"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className="flex flex-1 gap-2 min-w-0">
                <div className="relative flex-1 min-w-0">
                  <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="or paste image URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrlImage() } }}
                    className="pl-8 text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addUrlImage}
                  disabled={!urlInput.trim()}
                  className="flex-shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>
            <p className="text-xs text-slate-400">Max 5 MB per photo · JPG, PNG, GIF or WebP accepted</p>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} className="rounded" />
              <span className="text-sm font-medium">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => update('isFeatured', e.target.checked)} className="rounded" />
              <span className="text-sm font-medium">Featured</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-1.5" />Saving...</> : (trip?._id ? 'Save Changes' : 'Create Trip')}
          </Button>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}
