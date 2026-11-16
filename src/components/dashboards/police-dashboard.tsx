'use client'

import { useState, useEffect, useMemo } from 'react'
import { Shield, Search, Users, Hotel as HotelIcon, BedDouble, Phone, AlertCircle, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { store } from '@/lib/data'
import { getMergedHotels } from '@/lib/hotel-store'
import type { Hotel } from '@/lib/data'

// Mock guest registry — in production this would come from hotel check-in data.
interface GuestRecord {
  id: string
  guestName: string
  hotelId: string
  hotelName: string
  roomNumber: string
  checkIn: string
  checkOut: string
  idType: string
  nationality: string
}

function generateGuestRegistry(hotels: Hotel[]): GuestRecord[] {
  const names = [
    'Abebe Bekele', 'Sara Ahmed', 'John Smith', 'Chaltu Tolasa', 'David Wilson',
    'Helen Girma', 'Michael Brown', 'Fatima Hassan', 'Yonas Tadesse', 'Emma Johnson',
    'Kedir Ali', 'Sophie Martin', 'Daniel Lee', 'Almaz Tesfaye', 'Robert Garcia',
    'Maria Gonzalez', 'Tesfaye Lemma', 'Anna Schmidt', 'Marco Rossi', 'Liya Kebede',
    'James O\'Connor', 'Rahel Solomon', 'Ahmed Yimer', 'Jennifer Taylor',
    'Dawit Haile', 'Aster Wolde', 'Chris Evans', 'Birtukan Mulu', 'Omar Farah',
  ]
  const nationalities = ['Ethiopian', 'American', 'British', 'German', 'French', 'Italian', 'Spanish', 'Kenyan', 'Nigerian', 'Canadian']
  const idTypes = ['National ID', 'Passport', 'Driver License']

  const records: GuestRecord[] = []
  let id = 1
  for (const h of hotels) {
    // Generate 1-4 guest records per occupied room (sampled, not all rooms)
    const sampleCount = Math.min(h.occupiedRooms, Math.max(2, Math.floor(h.occupiedRooms / 3) + 2))
    for (let i = 0; i < sampleCount; i++) {
      const name = names[Math.floor(Math.random() * names.length)]
      const nationality = nationalities[Math.floor(Math.random() * nationalities.length)]
      const idType = idTypes[Math.floor(Math.random() * idTypes.length)]
      const checkInDaysAgo = Math.floor(Math.random() * 7)
      const stayDays = 1 + Math.floor(Math.random() * 6)
      const checkIn = new Date(Date.now() - checkInDaysAgo * 86400000).toISOString()
      const checkOut = new Date(Date.now() + (stayDays - checkInDaysAgo) * 86400000).toISOString()
      records.push({
        id: `g-${id++}`,
        guestName: name,
        hotelId: h.id,
        hotelName: h.name,
        roomNumber: `${100 + Math.floor(Math.random() * 200)}`,
        checkIn,
        checkOut,
        idType,
        nationality,
      })
    }
  }
  return records.sort((a, b) => new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime())
}

const EMERGENCY_CONTACTS = [
  { name: 'Bishoftu City Police', number: '9141' },
  { name: 'Bishoftu Tourist Police', number: '+251 11 433 0099' },
  { name: 'National Ambulance', number: '902' },
  { name: 'Fire Brigade', number: '939' },
  { name: 'Bishoftu Referral Hospital', number: '+251 11 433 1100' },
  { name: 'Tourism Office', number: '+251 22 111 0101' },
]

export function PoliceDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [guests, setGuests] = useState<GuestRecord[]>([])
  const [search, setSearch] = useState('')
  const [hotelFilter, setHotelFilter] = useState<string>('all')

  useEffect(() => {
    const hs = getMergedHotels()
    setHotels(hs)
    setGuests(generateGuestRegistry(hs))
  }, [])

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchesSearch = !search ||
        g.guestName.toLowerCase().includes(search.toLowerCase()) ||
        g.nationality.toLowerCase().includes(search.toLowerCase()) ||
        g.roomNumber.includes(search)
      const matchesHotel = hotelFilter === 'all' || g.hotelId === hotelFilter
      return matchesSearch && matchesHotel
    })
  }, [guests, search, hotelFilter])

  const totalGuests = hotels.reduce((s, h) => s + h.occupiedRooms, 0)
  const highOccupancyHotels = hotels.filter((h) => h.totalRooms > 0 && (h.occupiedRooms / h.totalRooms) > 0.7)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-7 w-7 text-rose-600" />
          Police Portal
        </h1>
        <p className="text-muted-foreground mt-1">Guest registry & security overview for Bishoftu.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Current Guests</CardDescription>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Active Hotels</CardDescription>
            <HotelIcon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hotels.filter((h) => h.occupiedRooms > 0).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">High Occupancy</CardDescription>
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{highOccupancyHotels.length}</div>
            <p className="text-xs text-muted-foreground">&gt; 70% occupied</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardDescription className="text-xs uppercase tracking-wider">Registry Records</CardDescription>
            <BedDouble className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{guests.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest registry */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Guest Registry</CardTitle>
            <CardDescription>Search across all hotel check-in records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, nationality, or room…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={hotelFilter} onValueChange={setHotelFilter}>
                <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All hotels" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">All hotels</SelectItem>
                  {hotels.map((h) => (
                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="max-h-[400px] overflow-y-auto overflow-x-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead className="text-center">Room</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Check-in</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No matching records.</TableCell>
                    </TableRow>
                  ) : (
                    filteredGuests.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell>
                          <div className="font-medium">{g.guestName}</div>
                          <div className="text-xs text-muted-foreground">{g.idType}</div>
                        </TableCell>
                        <TableCell className="text-sm">{g.hotelName}</TableCell>
                        <TableCell className="text-center tabular-nums">{g.roomNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{g.nationality}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(g.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          <span className="text-muted-foreground/70"> → {new Date(g.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground">Showing {filteredGuests.length} of {guests.length} records. Registry data is sampled for demo purposes.</p>
          </CardContent>
        </Card>

        {/* Emergency contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Phone className="h-5 w-5 text-rose-600" /> Emergency Contacts</CardTitle>
            <CardDescription>Tap to call</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {EMERGENCY_CONTACTS.map((c) => (
              <a
                key={c.name}
                href={`tel:${c.number.replace(/\s+/g, '')}`}
                className="flex items-center justify-between gap-2 rounded-lg border p-3 hover:border-rose-500/40 hover:bg-rose-500/5 transition-all"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium leading-tight truncate">{c.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{c.number}</p>
                </div>
                <Phone className="h-4 w-4 text-rose-600 shrink-0" />
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Hotel security overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hotel Security Overview</CardTitle>
          <CardDescription>Occupancy levels for security planning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {hotels.map((h) => {
              const occ = h.totalRooms > 0 ? Math.round((h.occupiedRooms / h.totalRooms) * 100) : 0
              const risk = occ > 80 ? 'high' : occ > 50 ? 'medium' : 'low'
              return (
                <div key={h.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{h.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {h.subCity}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${
                        risk === 'high' ? 'border-rose-500/30 text-rose-700 bg-rose-500/5' :
                        risk === 'medium' ? 'border-amber-500/30 text-amber-700 bg-amber-500/5' :
                        'border-emerald-500/30 text-emerald-700 bg-emerald-500/5'
                      }`}
                    >
                      {risk}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{h.occupiedRooms}/{h.totalRooms} rooms</span>
                    <span className="font-semibold tabular-nums">{occ}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
