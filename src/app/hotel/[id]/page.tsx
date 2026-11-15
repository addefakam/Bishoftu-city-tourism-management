'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  Star, MapPin, Phone, BedDouble, Users, ArrowLeft,
  CheckCircle2, XCircle, DollarSign, Building2, Loader2, Calendar, Globe, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Room {
  id: string
  number: string
  name: string
  type: string
  pricePerNight: number
  pricePerNightWeekend?: number
  capacity: number
  floor: number
  status: string
  available?: boolean
  amenities?: string
  description?: string
}

interface HotelDetail {
  id: string
  name: string
  type: string
  starRating: number
  subCity: string
  address: string
  phone: string | null
  website: string | null
  pricePerNight: number | null
  totalRooms: number
  occupiedRooms: number
  description: string
  imageUrl: string | null
}

export default function HotelDetailPage() {
  const params = useParams()
  const hotelId = params.id as string

  const [hotel, setHotel] = useState<HotelDetail | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAvail, setCheckingAvail] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<Room[] | null>(null)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')

  useEffect(() => {
    // Fetch hotel details + rooms
    Promise.all([
      fetch('/api/hotels').then(r => r.json()),
      fetch(`/api/gms-rooms?hotelId=${hotelId}`).then(r => r.json().catch(() => ({ rooms: [] }))),
    ]).then(([hotelsData, roomsData]) => {
      const found = (hotelsData.hotels || []).find((h: HotelDetail) => h.id === hotelId)
      setHotel(found || null)
      setRooms(roomsData.rooms || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [hotelId])

  const checkAvailability = async () => {
    if (!checkIn || !checkOut) return
    setCheckingAvail(true)
    setAvailableRooms(null)
    try {
      const res = await fetch(`/api/gms-rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&providerId=${hotelId}`)
      const data = await res.json()
      setAvailableRooms(data.rooms || [])
    } catch {
      setAvailableRooms([])
    } finally {
      setCheckingAvail(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="h-64 rounded-2xl mb-6" />
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-96 mb-2" />
        <Skeleton className="h-4 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (!hotel) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-xl font-bold">Hotel not found</h1>
        <p className="text-muted-foreground mt-2">This hotel may no longer be available.</p>
        <Button asChild className="mt-6">
          <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
        </Button>
      </div>
    )
  }

  const availableCount = hotel.totalRooms - hotel.occupiedRooms
  const occupancyRate = hotel.totalRooms > 0 ? Math.round((hotel.occupiedRooms / hotel.totalRooms) * 100) : 0

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      {/* Back button */}
      <Button asChild variant="ghost" className="gap-2 -ml-2">
        <Link href="/#hotels"><ArrowLeft className="h-4 w-4" /> Back to Hotels</Link>
      </Button>

      {/* Hero section */}
      <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-muted">
        {hotel.imageUrl ? (
          <img src={hotel.imageUrl} alt={hotel.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-100 to-cyan-100">
            <Building2 className="h-16 w-16 text-sky-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/95 text-foreground">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
              {hotel.starRating}-Star
            </Badge>
            <Badge variant="secondary" className="bg-white/90 text-foreground capitalize">{hotel.type}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{hotel.name}</h1>
          <p className="flex items-center gap-1.5 mt-1 text-white/90">
            <MapPin className="h-4 w-4" />
            {hotel.address}, {hotel.subCity}, Bishoftu
          </p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <BedDouble className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{hotel.totalRooms}</p>
            <p className="text-xs text-muted-foreground">Total Rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold text-emerald-600">{availableCount}</p>
            <p className="text-xs text-muted-foreground">Available</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-5 w-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold">{occupancyRate}%</p>
            <p className="text-xs text-muted-foreground">Occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="h-5 w-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold">{hotel.pricePerNight ? `${hotel.pricePerNight.toLocaleString()}` : '—'}</p>
            <p className="text-xs text-muted-foreground">ETB/night from</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact + Description */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">About {hotel.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{hotel.description}</p>
            {rooms.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold">Room Types Available</h4>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(rooms.map(r => r.type))).map(type => (
                    <Badge key={type} variant="outline" className="capitalize">{type}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hotel.phone && (
              <a href={`tel:${hotel.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                <Phone className="h-4 w-4 text-primary" />
                {hotel.phone}
              </a>
            )}
            {hotel.website && (
              <a
                href={hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Globe className="h-4 w-4 text-primary" />
                Visit Website
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {hotel.address}, {hotel.subCity}
            </div>
            <div className="flex flex-col gap-2 pt-2">
              {hotel.phone && (
                <Button className="w-full gap-2" asChild>
                  <a href={`tel:${hotel.phone}`}><Phone className="h-4 w-4" /> Call to Book</a>
                </Button>
              )}
              {hotel.website && (
                <Button variant="outline" className="w-full gap-2" asChild>
                  <a
                    href={hotel.website.startsWith('http') ? hotel.website : `https://${hotel.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Globe className="h-4 w-4" /> Visit Website <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Room availability checker */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Check Room Availability
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="text-xs text-muted-foreground mb-1 block">Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex-1 w-full">
              <label className="text-xs text-muted-foreground mb-1 block">Check-out</label>
              <input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={e => setCheckOut(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button
              onClick={checkAvailability}
              disabled={!checkIn || !checkOut || checkingAvail}
              className="gap-2"
            >
              {checkingAvail ? <Loader2 className="h-4 w-4 animate-spin" /> : <BedDouble className="h-4 w-4" />}
              Check Availability
            </Button>
          </div>

          {/* Availability results */}
          {availableRooms !== null && (
            <div className="space-y-2">
              {availableRooms.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <XCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                  <p>No rooms available for the selected dates.</p>
                  <p className="text-xs mt-1">Try different dates or contact the hotel directly.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-emerald-600">
                    {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableRooms.map(room => (
                      <div key={room.id} className="rounded-lg border p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{room.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{room.type} · Floor {room.floor} · {room.capacity} guests</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{room.pricePerNight.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground">ETB/night</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All rooms list */}
      {rooms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">All Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rooms.map(room => (
                <div key={room.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{room.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{room.type}</p>
                    </div>
                    <Badge variant={room.status === 'AVAILABLE' ? 'default' : 'secondary'} className="text-[10px]">
                      {room.status}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-3 w-3" /> {room.capacity}
                    </span>
                    <span className="font-bold text-primary">{room.pricePerNight.toLocaleString()} ETB</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
