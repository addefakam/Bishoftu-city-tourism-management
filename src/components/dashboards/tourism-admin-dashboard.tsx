'use client'

import { useState, useEffect } from 'react'
import { Building2, Hotel as HotelIcon, Users, BedDouble, TrendingUp, Shield, User, MapPin, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { store } from '@/lib/data'
import { getMergedHotels } from '@/lib/hotel-store'
import { getAllUsers, type User as AuthUser } from '@/lib/auth'
import type { Hotel } from '@/lib/data'

const ROLE_BADGE_STYLES: Record<string, string> = {
  tourism_admin: 'bg-primary/10 text-primary border-primary/20',
  hotel_manager: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  police: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  guest: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
}

export function TourismAdminDashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [users, setUsers] = useState<AuthUser[]>([])

  useEffect(() => {
    setHotels(getMergedHotels())
    setUsers(getAllUsers())
  }, [])

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
    </div>
  )
}
