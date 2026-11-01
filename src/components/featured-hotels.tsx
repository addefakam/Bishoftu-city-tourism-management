'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, MapPin, Phone, ArrowRight, BedDouble } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Hotel } from '@/lib/types'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} star rating`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted'}`}
        />
      ))}
    </div>
  )
}

export function FeaturedHotelsSection() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/hotels')
      .then((r) => r.json())
      .then((data) => {
        // Prefer featured hotels, then 5-star, then 4-star — show up to 6
        const list: Hotel[] = data.hotels
        const featured = list.filter((h) => h.featured)
        const others = list.filter((h) => !h.featured)
        setHotels([...featured, ...others].slice(0, 6))
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="hotels" className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Stay in Bishoftu</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Featured Hotels</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              A selection of approved, top-rated accommodations across Bishoftu — from lakeside resorts to central business hotels.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 shrink-0">
            <Link href="#hotels">
              View All Hotels <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((h) => (
              <Card key={h.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/10] bg-muted">
                  {h.imageUrl ? (
                    <img src={h.imageUrl} alt={h.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <BedDouble className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge className="bg-white/95 text-foreground hover:bg-white shadow-sm">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400 mr-1" />
                      {h.starRating}-Star
                    </Badge>
                    <Badge variant="secondary" className="capitalize bg-white/95 hover:bg-white shadow-sm">
                      {h.type}
                    </Badge>
                  </div>
                </div>
                <CardContent className="flex-1 p-5">
                  <h3 className="text-lg font-semibold leading-snug line-clamp-1">{h.name}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {h.subCity}, Bishoftu
                  </p>
                  <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{h.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Stars rating={h.starRating} />
                    <span className="text-xs text-muted-foreground">{h.totalRooms} rooms</span>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex items-center justify-between gap-3">
                  <div>
                    {h.pricePerNight ? (
                      <>
                        <p className="text-xs text-muted-foreground">From</p>
                        <p className="text-lg font-bold text-primary">
                          {h.pricePerNight.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">ETB/night</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">Contact hotel for rates</p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" className="gap-1.5">
                    {h.phone ? <Phone className="h-3.5 w-3.5" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    View Hotel
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
