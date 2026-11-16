'use client'

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import { Building2, Hotel as HotelIcon, Users, BedDouble, TrendingUp, Shield, User, MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { store } from '@/lib/data'
import { updateHotel } from '@/lib/hotel-store'
import { getAllUsers, type User as AuthUser } from '@/lib/auth'
import { GmsConnectionSettings } from '@/components/gms-connection-settings'
import { SiteImageManager } from '@/components/site-image-manager'
import { Globe, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react'
import { compressToDataUrl } from '@/lib/image-utils'
import type { Hotel } from '@/lib/types'

const ROLE_BADGE_STYLES: Record<string, string> = {
  tourism_admin: 'bg-primary/10 text-primary border-primary/20',
  hotel_manager: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  police: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  guest: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
}

// Show a short-lived inline status next to the row the admin just edited.
function flash(
  setter: Dispatch<SetStateAction<string | null>>,
  id: string
) {
  setter(id)
  window.setTimeout(() => setter((cur) => (cur === id ? null : cur)), 2500)
}

export function TourismAdminDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])

  const [websiteOverrides, setWebsiteOverrides] = useState<Record<string, string>>({})
  const [uploadingHotelId, setUploadingHotelId] = useState<string | null>(null)
  const [savedHotelId, setSavedHotelId] = useState<string | null>(null)
  const [uploadErrorHotelId, setUploadErrorHotelId] = useState<string | null>(null)
  const [uploadErrorMsg, setUploadErrorMsg] = useState<string | null>(null)
  const [websiteSavedHotelId, setWebsiteSavedHotelId] = useState<string | null>(null)
  const [websiteErrorHotelId, setWebsiteErrorHotelId] = useState<string | null>(null)

  useEffect(() => {
    // Fetch hotels from /api/hotels (uses GMS live data when configured)
    fetch('/api/hotels')
      .then((r) => r.json())
      .then((data) => setHotels(data.hotels || []))
      .catch(() => setHotels([]))
    setUsers(getAllUsers())

    // Fetch saved website overrides from server
    fetch('/api/hotel-overrides')
      .then((r) => r.json())
      .then((data) => {
        const overrides: Record<string, string> = {}
        for (const [hotelId, override] of Object.entries(data.overrides || {})) {
          const o = override as any
          if (o.website) overrides[hotelId] = o.website
        }
        setWebsiteOverrides(overrides)
      })
      .catch(() => {})
  }, [])

  // Upload a card image for a hotel (same endpoint tourists use on /hotels):
  // compress in the browser, persist server-side, update the row thumbnail.
  async function handleCardImageUpload(hotelId: string, file: File | undefined) {
    if (!file) return
    setUploadingHotelId(hotelId)
    setUploadErrorHotelId(null)
    setUploadErrorMsg(null)
    try {
      const dataUrl = await compressToDataUrl(file)
      const res = await fetch(`/api/hotels/${hotelId}/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || `Upload failed (${res.status})`)
      }
      setHotels((prev) =>
        prev.map((x) => (x.id === hotelId ? { ...x, touristPhotoUrl: dataUrl } : x))
      )
      flash(setSavedHotelId, hotelId)
    } catch (e) {
      setUploadErrorHotelId(hotelId)
      setUploadErrorMsg(e instanceof Error ? e.message : 'Upload failed')
      console.error(e)
    } finally {
      setUploadingHotelId(null)
    }
  }

  const totalRooms = hotels.reduce((s, h) => s + h.totalRooms, 0)
  const occupiedRooms = hotels.reduce((s, h) => s + h.occupiedRooms, 0)
  const availableRooms = totalRooms - occupiedRooms
  const cityOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0
  const attractions = store.attractions.count()
  const businesses = store.businesses.count() + hotels.length

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Building2 className="h-7 w-7 text-primary" />
          Tourism Office Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Full platform oversight — {hotels.length} hotels, {users.length} registered users.</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Registered Hotels</CardDescription>
            <HotelIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotels.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Total Rooms</CardDescription>
            <BedDouble className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Current Guests</CardDescription>
            <Users className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{occupiedRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">City Occupancy</CardDescription>
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{cityOccupancy}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* All hotels table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">All Hotels</CardTitle>
            <CardDescription>Live occupancy across all registered hotels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[420px] overflow-y-auto overflow-x-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hotel</TableHead>
                    <TableHead className="text-center">Stars</TableHead>
                    <TableHead className="text-center">Rooms</TableHead>
                    <TableHead className="text-center">Occupancy</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotels.map((h) => {
                    const occ = h.totalRooms > 0 ? Math.round((h.occupiedRooms / h.totalRooms) * 1000) / 10 : 0
                    return (
                      <TableRow key={h.id}>
                        <TableCell>
                          <div className="font-medium">{h.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {h.subCity}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {h.starRating}
                          </span>
                        </TableCell>
                        <TableCell className="text-center tabular-nums">{h.occupiedRooms}/{h.totalRooms}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs font-semibold tabular-nums">{occ}%</span>
                            <Progress value={occ} className="h-1.5 w-16" />
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available rooms</span>
                <span className="font-semibold">{availableRooms}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Attractions</span>
                <span className="font-semibold">{attractions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Businesses</span>
                <span className="font-semibold">{businesses}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Registered users</span>
                <span className="font-semibold">{users.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Users by Role</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {(['tourism_admin', 'hotel_manager', 'police', 'guest'] as const).map((role) => {
                const count = users.filter((u) => u.role === role).length
                const label = { tourism_admin: 'Tourism Admins', hotel_manager: 'Hotel Managers', police: 'Police', guest: 'Guests' }[role]
                const Icon = { tourism_admin: Building2, hotel_manager: HotelIcon, police: Shield, guest: User }[role]
                return (
                  <div key={role} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {label}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* All registered users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Registered Users</CardTitle>
          <CardDescription>All accounts on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[360px] overflow-y-auto overflow-x-hidden rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={ROLE_BADGE_STYLES[u.role] ?? ''}>
                        {u.role.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Website Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Hotel Website Links &amp; Card Images
          </CardTitle>
          <CardDescription>
            Add website links and upload card images per hotel — saved permanently to server.
            The image appears on the hotel card above the hotel name.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hotels.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{h.subCity}</p>
                </div>
                <input
                  type="url"
                  placeholder="https://hotel-website.com"
                  defaultValue={websiteOverrides[h.id] || ''}
                  onBlur={async (e) => {
                    const url = e.target.value.trim()
                    // Build the full overrides object with this hotel's website
                    const newOverrides: Record<string, any> = {}
                    for (const [hid, wurl] of Object.entries(websiteOverrides)) {
                      newOverrides[hid] = { website: wurl }
                    }
                    if (url) {
                      newOverrides[h.id] = { website: url }
                    } else {
                      delete newOverrides[h.id]
                    }
                    // Save to server (persists in GMS database)
                    const res = await fetch('/api/hotel-overrides', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(newOverrides),
                    })
                    if (res.ok) {
                      const newMap: Record<string, string> = {}
                      for (const [hid, ov] of Object.entries(newOverrides)) {
                        const o = ov as any
                        if (o.website) newMap[hid] = o.website
                      }
                      setWebsiteOverrides(newMap)
                      flash(setWebsiteSavedHotelId, h.id)
                    } else {
                      flash(setWebsiteErrorHotelId, h.id)
                    }
                  }}
                  className="flex-1 max-w-xs rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
                {websiteOverrides[h.id] && (
                  <a
                    href={websiteOverrides[h.id].startsWith('http') ? websiteOverrides[h.id] : `https://${websiteOverrides[h.id]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-xs flex items-center gap-1"
                  >
                    Test <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {websiteSavedHotelId === h.id && (
                  <span className="text-xs text-emerald-600 whitespace-nowrap">Link saved ✓</span>
                )}
                {websiteErrorHotelId === h.id && (
                  <span className="text-xs text-destructive whitespace-nowrap">Save failed</span>
                )}
                {/* Card image: current thumbnail + upload control */}
                <div className="flex items-center gap-2">
                  {(h.touristPhotoUrl ?? h.imageUrl) ? (
                    <img
                      src={h.touristPhotoUrl ?? h.imageUrl ?? undefined}
                      alt={`Current card image for ${h.name}`}
                      className="h-10 w-14 rounded-md border object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-14 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                  <label
                    className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-input bg-background px-2.5 text-xs font-medium transition-colors ${
                      uploadingHotelId === h.id ? 'pointer-events-none opacity-60' : 'hover:bg-accent'
                    }`}
                    title="Upload a card image for this hotel — shown on the hotel card above the hotel name"
                  >
                    {uploadingHotelId === h.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <ImageIcon className="h-3.5 w-3.5" />
                        Upload image
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingHotelId === h.id}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        void handleCardImageUpload(h.id, file)
                      }}
                    />
                  </label>
                  {uploadErrorHotelId === h.id && (
                    <span className="text-xs text-destructive whitespace-nowrap">{uploadErrorMsg ?? 'Upload failed'}</span>
                  )}
                  {savedHotelId === h.id && (
                    <span className="text-xs text-emerald-600 whitespace-nowrap">Saved ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* GMS Integration Settings */}
      <GmsConnectionSettings />

      {/* Site Image Management — replace hardcoded photos */}
      <SiteImageManager />
    </div>
  )
}
