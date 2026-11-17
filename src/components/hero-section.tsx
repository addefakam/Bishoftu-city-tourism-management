'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Waves, MapPin, Sparkles, Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface CityStats {
  registeredHotels: number
  totalRooms: number
  availableRooms: number
  currentGuests: number
  cityOccupancy: number
  source?: string
}

function formatStat(value: number, suffix: string = ''): string {
  return value.toLocaleString() + suffix
}

// Default carousel images — used if API not configured
const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80',
]

export function HeroSection() {
  const [stats, setStats] = useState<CityStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)
  const [carouselImages, setCarouselImages] = useState<string[]>(DEFAULT_IMAGES)
  const [interval, setIntervalSec] = useState(5)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  useEffect(() => {
    // Fetch carousel settings (images + interval) from API
    fetch('/api/carousel-settings')
      .then((r) => r.json())
      .then((data) => {
        const settings = data.data
        if (settings?.images?.length > 0) setCarouselImages(settings.images)
        if (settings?.interval) setIntervalSec(settings.interval)
      })
      .catch(() => {})

    // Fetch hotels for stats
    fetch('/api/hotels')
      .then((r) => r.json())
      .then((data) => {
        const hotels = data.hotels || []
        const totalRooms = hotels.reduce((s: number, h: any) => s + h.totalRooms, 0)
        const occupiedRooms = hotels.reduce((s: number, h: any) => s + h.occupiedRooms, 0)
        setStats({
          registeredHotels: hotels.length,
          totalRooms,
          availableRooms: totalRooms - occupiedRooms,
          currentGuests: occupiedRooms,
          cityOccupancy: totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0,
          source: data.source || 'static',
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % carouselImages.length)
    }, interval * 1000)
    return () => clearInterval(timer)
  }, [carouselImages, interval])

  const goToSlide = (index: number) => {
    setCurrentImage(((index % carouselImages.length) + carouselImages.length) % carouselImages.length)
  }

  const nextSlide = () => goToSlide(currentImage + 1)
  const prevSlide = () => goToSlide(currentImage - 1)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      nextSlide()
    } else if (touchEndX.current - touchStartX.current > 50) {
      prevSlide()
    }
  }

  const heroStats = stats
    ? [
        { value: formatStat(stats.registeredHotels), label: 'Registered Hotels' },
        { value: formatStat(stats.totalRooms), label: 'Total Rooms' },
        { value: formatStat(stats.currentGuests), label: 'Current Guests' },
        { value: `${stats.cityOccupancy}%`, label: 'City Occupancy' },
      ]
    : []

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-slate-900"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Image carousel — full bleed, no overlay cover */}
      <div className="absolute inset-0 z-0">
        {carouselImages.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === currentImage ? 1 : 0 }}
          >
            <img
              src={img}
              alt={`Bishoftu scenery ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
        {/* Minimal gradient only at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent" />
      </div>

      {/* Carousel arrows — left and right */}
      <button
        onClick={prevSlide}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Carousel dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {carouselImages.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-2 rounded-full transition-all ${
              i === currentImage ? 'w-8 bg-white' : 'w-2 bg-white/40'
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
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
            A unified digital platform for Bishoftu City&apos;s tourism and hospitality ecosystem — connecting visitors, hotels, the Tourism Office, and authorized public services.
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
              <Link href="/virtual-bishoftu">
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

        {/* Stats strip — same data source as hotels section */}
        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md">
          {loading || !stats ? (
            <>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="px-5 py-6 text-center bg-white/5">
                  <Skeleton className="h-9 w-20 mx-auto bg-white/20" />
                  <Skeleton className="h-3 w-28 mx-auto mt-2 bg-white/15" />
                </div>
              ))}
            </>
          ) : (
            heroStats.map((s) => (
              <div key={s.label} className="px-5 py-6 text-center bg-white/5">
                <p className="text-3xl sm:text-4xl font-bold text-white tabular-nums">{s.value}</p>
                <p className="mt-1 text-xs sm:text-sm text-white/80">{s.label}</p>
              </div>
            ))
          )}
        </div>

        {stats?.source === 'gms' && (
          <p className="mt-3 text-center text-xs text-white/60">
            Live data from Bishoftu GMS · refreshed on each visit
          </p>
        )}
      </div>
    </section>
  )
}
