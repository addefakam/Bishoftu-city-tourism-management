'use client'

import { useState, useEffect } from 'react'
import { Hotel as HotelIcon, BedDouble, TrendingUp, Save, Plus, Star, Phone, Mail, MapPin, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/lib/auth'
import { store } from '@/lib/data'
import { getMergedHotelById, updateHotel, addNews, getMergedNews } from '@/lib/hotel-store'
import type { Hotel, NewsPost } from '@/lib/data'
import { useToast } from '@/hooks/use-toast'

export function HotelManagerDashboard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [allNews, setAllNews] = useState<NewsPost[]>([])

  // Editable fields
  const [description, setDescription] = useState('')
  const [pricePerNight, setPricePerNight] = useState<number | ''>('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [occupiedRooms, setOccupiedRooms] = useState(0)

  // News form
  const [newsTitle, setNewsTitle] = useState('')
  const [newsExcerpt, setNewsExcerpt] = useState('')

  function refresh() {
    if (!user?.hotelId) return
    const h = getMergedHotelById(user.hotelId)
    if (h) {
      setHotel(h)
      setDescription(h.description)
      setPricePerNight(h.pricePerNight ?? '')
      setPhone(h.phone ?? '')
      setEmail(h.email ?? '')
      setOccupiedRooms(h.occupiedRooms)
    }
    setAllNews(getMergedNews().filter((n) => n.hotelName === h?.name))
  }

  useEffect(() => { refresh() }, [user])

  if (!user?.hotelId || !hotel) {
    return (
      <div className="py-20 text-center">
        <HotelIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground">No hotel is linked to your account. Please contact the Tourism Office.</p>
      </div>
    )
  }

  const occupancyRate = hotel.totalRooms > 0 ? Math.round((occupiedRooms / hotel.totalRooms) * 1000) / 10 : 0
  const availableRooms = hotel.totalRooms - occupiedRooms

  function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    const result = updateHotel(hotel!.id, {
      description,
      pricePerNight: pricePerNight === '' ? null : Number(pricePerNight),
      phone: phone || null,
      email: email || null,
    })
    if (result.ok) {
      toast({ title: 'Saved', description: 'Hotel details updated successfully.' })
      refresh()
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    }
  }

  function handleSaveOccupancy() {
    const clamped = Math.max(0, Math.min(hotel!.totalRooms, occupiedRooms))
    const result = updateHotel(hotel!.id, { occupiedRooms: clamped })
    if (result.ok) {
      setOccupiedRooms(clamped)
      toast({ title: 'Occupancy updated', description: `${clamped}/${hotel!.totalRooms} rooms now occupied (${Math.round((clamped / hotel!.totalRooms) * 100)}%).` })
      refresh()
    }
  }

  function handlePostNews(e: React.FormEvent) {
    e.preventDefault()
    if (!newsTitle.trim() || !newsExcerpt.trim()) return
    const result = addNews({ title: newsTitle, excerpt: newsExcerpt, hotelName: hotel!.name })
    if (result.ok) {
      toast({ title: 'News posted', description: 'Your update is now live on the platform.' })
      setNewsTitle('')
      setNewsExcerpt('')
      refresh()
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{hotel.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" /> {hotel.address}
            <Badge variant="outline" className="ml-1">{hotel.starRating}★ {hotel.type}</Badge>
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Total Rooms</CardDescription>
            <BedDouble className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotel.totalRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Occupied</CardDescription>
            <HotelIcon className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{occupiedRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Available</CardDescription>
            <BedDouble className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{availableRooms}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Occupancy</CardDescription>
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{occupancyRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Update occupancy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Update Room Occupancy</CardTitle>
            <CardDescription>Set how many rooms are currently checked in. This updates city-wide statistics immediately.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Occupied rooms</span>
                <span className="font-semibold tabular-nums">{occupiedRooms} / {hotel.totalRooms}</span>
              </div>
              <input
                type="range"
                min={0}
                max={hotel.totalRooms}
                value={occupiedRooms}
                onChange={(e) => setOccupiedRooms(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <Progress value={occupancyRate} className="h-2" />
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Badge variant="outline">{availableRooms} available</Badge>
              <Badge variant="secondary">{occupancyRate}% occupancy</Badge>
            </div>
            <Button onClick={handleSaveOccupancy} className="w-full gap-2">
              <Save className="h-4 w-4" /> Save Occupancy
            </Button>
          </CardContent>
        </Card>

        {/* Post news */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Post a Hotel Update</CardTitle>
            <CardDescription>Announce a new event, promotion, or service. Visible on the public homepage.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePostNews} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="news-title">Title</Label>
                <Input id="news-title" value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} placeholder="e.g. New Year's Eve Dinner Special" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="news-excerpt">Summary</Label>
                <Textarea id="news-excerpt" value={newsExcerpt} onChange={(e) => setNewsExcerpt(e.target.value)} placeholder="Brief description of the news…" rows={3} required />
              </div>
              <Button type="submit" className="w-full gap-2">
                <Plus className="h-4 w-4" /> Publish Update
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Edit hotel details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Edit Hotel Details</CardTitle>
          <CardDescription>Update the public-facing information shown on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveDetails} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="desc">Description</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="price" className="flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5" /> Price per night (ETB)</Label>
              <Input id="price" type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value === '' ? '' : Number(e.target.value))} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+251 …" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="reservations@…" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Save Details</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Recent news from this hotel */}
      {allNews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Recent Updates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {allNews.slice(0, 5).map((n) => (
              <div key={n.id} className="border-l-2 border-primary/30 pl-3">
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.excerpt}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
