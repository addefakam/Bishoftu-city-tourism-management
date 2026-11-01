'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Building2, BedDouble, Users, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import type { CityStats } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  resort: 'oklch(0.51 0.12 178)',
  hotel: 'oklch(0.7 0.13 75)',
  lodge: 'oklch(0.55 0.13 145)',
  motel: 'oklch(0.6 0.18 35)',
}

function StatCard({ icon: Icon, value, label, hint, accent }: {
  icon: React.ElementType; value: number | string; label: string; hint: string; accent: string
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardDescription className="text-xs uppercase tracking-wider">{label}</CardDescription>
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-5 w-5" />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

export function CityOverviewSection() {
  const [stats, setStats] = useState<CityStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stats) {
    return (
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-96 mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
          </div>
          <Skeleton className="mt-8 h-72 rounded-xl" />
        </div>
      </section>
    )
  }

  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">City Overview</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Bishoftu Tourism at a Glance</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Real-time city-wide accommodation statistics from the central database, refreshed continuously as hotels report occupancy.
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Building2} value={stats.registeredHotels}
            label="Registered Hotels" hint="Approved & operational"
            accent="bg-primary/10 text-primary"
          />
          <StatCard
            icon={BedDouble} value={stats.totalRooms}
            label="Total Rooms" hint="Across all hotels"
            accent="bg-amber-500/10 text-amber-700"
          />
          <StatCard
            icon={Users} value={stats.currentGuests}
            label="Current Guests" hint="Checked in now"
            accent="bg-emerald-500/10 text-emerald-700"
          />
          <StatCard
            icon={TrendingUp} value={`${stats.cityOccupancy}%`}
            label="City Occupancy" hint="Live occupancy rate"
            accent="bg-rose-500/10 text-rose-700"
          />
        </div>

        {/* Top hotels + breakdown */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top performing hotels */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Top Performing Hotels</CardTitle>
              <CardDescription>Ranked by current occupancy rate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.topHotels.map((h, i) => (
                <div key={h.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        i === 0 ? 'bg-amber-500 text-white' : i === 1 ? 'bg-slate-400 text-white' : i === 2 ? 'bg-orange-700 text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </span>
                      <Link
                        href="#hotels"
                        className="truncate text-sm font-medium hover:text-primary transition-colors"
                        title={h.name}
                      >
                        {h.name}
                      </Link>
                      <Badge variant="outline" className="shrink-0 text-[10px]">{h.subCity}</Badge>
                    </div>
                    <span className="text-sm font-semibold text-primary tabular-nums whitespace-nowrap">
                      {h.occupancy}%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={h.occupancy} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {h.occupiedRooms}/{h.totalRooms} rooms · {h.availableRooms} avail.
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pie chart — hotels by type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hotels by Type</CardTitle>
              <CardDescription>Distribution of accommodation types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.byType}
                      dataKey="count"
                      nameKey="type"
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={75}
                      paddingAngle={2}
                    >
                      {stats.byType.map((entry) => (
                        <Cell key={entry.type} fill={TYPE_COLORS[entry.type] ?? 'oklch(0.5 0 0)'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                      formatter={(value: number, _name, props) => [`${value} hotel${value !== 1 ? 's' : ''}`, props?.payload?.type ?? '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-3 space-y-1.5">
                {stats.byType.map((t) => (
                  <li key={t.type} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 capitalize">
                      <span className="h-3 w-3 rounded-full" style={{ background: TYPE_COLORS[t.type] ?? '#888' }} />
                      {t.type}
                    </span>
                    <span className="font-semibold tabular-nums">{t.count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sub-city bar chart */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Hotels by Sub-City</CardTitle>
            <CardDescription>Geographic distribution across Bishoftu&apos;s sub-cities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.bySubCity} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <XAxis
                    dataKey="subCity"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip
                    cursor={{ fill: 'oklch(0.96 0.01 95)' }}
                    contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => [`${value} hotel${value !== 1 ? 's' : ''}`, 'Hotels']}
                  />
                  <Bar dataKey="count" name="Hotels" radius={[6, 6, 0, 0]}>
                    {stats.bySubCity.map((_, i) => (
                      <Cell key={i} fill="oklch(0.51 0.12 178)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="#hotels">
              View all {stats.registeredHotels} hotels <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
