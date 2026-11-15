'use client'

import Link from 'next/link'
import { Waves, MapPin, Sparkles, Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const heroStats = [
  { value: '10', label: 'Registered Hotels' },
  { value: '520', label: 'Total Rooms' },
  { value: '245', label: 'Current Guests' },
  { value: '47.1%', label: 'City Occupancy' },
]

export function HeroSection() {
  return (
    <section id="home" className="relative overflow-hidden bg-primary">
      {/* Background image + gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
          alt="Crater lake at Bishoftu"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/70 to-primary/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <div className="max-w-3xl text-white">
          <Badge
            variant="secondary"
            className="mb-4 gap-1.5 bg-white/15 text-white border-white/20 backdrop-blur hover:bg-white/20"
          >
            <MapPin className="h-3.5 w-3.5" /> Bishoftu · Oromia, Ethiopia
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Bishoftu — Oromia&apos;s <span className="text-amber-300">Lake City</span>
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-medium text-white/90">
            Bishoftu City Tourism Management System
          </p>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/85 leading-relaxed">
            A unified digital platform for Bishoftu City&apos;s tourism and hospitality ecosystem — connecting visitors, hotels, the Tourism Office, and authorized public services through trusted information, efficient hotel management, tourism services, and city-wide insights.
          </p>

          {/* Search bar */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hotels, lakes, attractions…"
                className="pl-10 h-12 bg-white/95 border-white/30 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button size="lg" className="h-12 gap-2 bg-amber-500 hover:bg-amber-600 text-white">
              <Sparkles className="h-4 w-4" /> Search
            </Button>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="#virtual">
                <Waves className="h-4 w-4" /> Explore Virtual Bishoftu
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="gap-2 border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="#hotels">
                Find a Hotel <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
          {heroStats.map((s) => (
            <div key={s.label} className="px-5 py-6 text-center bg-white/5">
              <p className="text-3xl sm:text-4xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-xs sm:text-sm text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
