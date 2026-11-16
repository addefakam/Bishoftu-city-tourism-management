'use client'

import { useState, useEffect, useRef } from 'react'
import { Image as ImageIcon, Upload, Trash2, Loader2, RotateCcw, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import { compressToDataUrl } from '@/lib/image-utils'
import { store } from '@/lib/data'

interface SiteImageItem {
  key: string
  label: string
  currentUrl: string
  defaultUrl: string
  isOverride: boolean
}

const FIXED_IMAGES: Array<{ key: string; label: string; defaultUrl: string }> = [
  {
    key: 'hero_background',
    label: 'Home Screen — Hero Background',
    defaultUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
  },
  {
    key: 'virtual_bishoftu',
    label: 'Featured Destination — Lake Hora / "See Bishoftu Before You Arrive"',
    defaultUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80',
  },
]

export function SiteImageManager() {
  const { toast } = useToast()
  const [images, setImages] = useState<Record<string, string>>({})
  const [defaults, setDefaults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [uploadingKey, setUploadingKey] = useState<string | null>(null)
  const [resettingKey, setResettingKey] = useState<string | null>(null)

  // Attraction images from the static store (for per-attraction uploads)
  const attractions = store.attractions.findMany()

  useEffect(() => {
    refresh()
  }, [])

  function refresh() {
    setLoading(true)
    fetch('/api/site-images')
      .then((r) => r.json())
      .then((data) => {
        setImages(data.images ?? {})
        setDefaults(data.defaults ?? {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  async function handleUpload(key: string, file: File | undefined) {
    if (!file) return
    setUploadingKey(key)
    try {
      const dataUrl = await compressToDataUrl(file)
      const res = await fetch('/api/site-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, dataUrl }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Upload failed (${res.status})`)
      }
      toast({ title: 'Image updated', description: 'The new image is now live on the site.' })
      refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      toast({ title: 'Upload failed', description: msg, variant: 'destructive' })
    } finally {
      setUploadingKey(null)
    }
  }

  async function handleReset(key: string) {
    setResettingKey(key)
    try {
      const res = await fetch(`/api/site-images?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Reset failed (${res.status})`)
      }
      toast({ title: 'Reverted to default', description: 'The default image is now restored.' })
      refresh()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reset failed'
      toast({ title: 'Reset failed', description: msg, variant: 'destructive' })
    } finally {
      setResettingKey(null)
    }
  }

  // Build the list of all configurable images (fixed + per-attraction)
  const allItems: SiteImageItem[] = [
    ...FIXED_IMAGES.map((fi) => ({
      key: fi.key,
      label: fi.label,
      defaultUrl: fi.defaultUrl,
      currentUrl: images[fi.key] ?? fi.defaultUrl,
      isOverride: images[fi.key] !== undefined && images[fi.key] !== (defaults[fi.key] ?? fi.defaultUrl),
    })),
    ...attractions.map((a) => ({
      key: `attraction_${a.id}`,
      label: `Attraction — ${a.name}`,
      defaultUrl: a.imageUrl ?? '',
      currentUrl: images[`attraction_${a.id}`] ?? a.imageUrl ?? '',
      isOverride: images[`attraction_${a.id}`] !== undefined,
    })),
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          Site Image Management
        </CardTitle>
        <CardDescription>
          Replace any hardcoded photo on the public site — hero background, featured destination, attraction cards, and more.
          Uploads are saved permanently and visible to all visitors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-4">
            {allItems.map((item) => (
              <ImageRow
                key={item.key}
                item={item}
                uploading={uploadingKey === item.key}
                resetting={resettingKey === item.key}
                onUpload={(file) => handleUpload(item.key, file)}
                onReset={() => handleReset(item.key)}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ImageRow({
  item,
  uploading,
  resetting,
  onUpload,
  onReset,
}: {
  item: SiteImageItem
  uploading: boolean
  resetting: boolean
  onUpload: (file: File | undefined) => void
  onReset: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-lg border p-4">
      {/* Preview */}
      <div className="h-24 w-32 sm:h-20 sm:w-28 shrink-0 overflow-hidden rounded-md bg-muted relative">
        {item.currentUrl ? (
          <img src={item.currentUrl} alt={item.label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        {item.isOverride && (
          <span className="absolute top-1 right-1 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            CUSTOM
          </span>
        )}
      </div>

      {/* Label + actions */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
        <div>
          <p className="text-sm font-medium leading-snug">{item.label}</p>
          <p className="text-xs text-muted-foreground font-mono">{item.key}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? 'Uploading…' : 'Upload New'}
          </Button>
          {item.isOverride && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground"
              disabled={resetting}
              onClick={onReset}
            >
              {resetting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
              {resetting ? 'Resetting…' : 'Reset to Default'}
            </Button>
          )}
          {item.isOverride && !uploading && !resetting && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3 w-3" /> Override active
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
