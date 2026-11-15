'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Star, MapPin, ArrowRight, ArrowLeft, BedDouble, Globe, SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis,
} from '@/components/ui/pagination'
import { mergeLocalUpdates } from '@/lib/hotel-store'
import type { Hotel } from '@/lib/types'

const PAGE_SIZE = 9

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

function pageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  // Compact window: 1 … (c-1 c c+1) … total — always shows first and last page.
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)
  const out: Array<number | 'ellipsis'> = []
  let prev = 0
  for (const n of sorted) {
    if (n - prev > 1) out.push('ellipsis')
    out.push(n)
    prev = n
  }
  return out
}

export default function AllHotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    fetch('/api/hotels')
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`)
        return r.json()
      })
      .then((data) => {
        // Merge localStorage overrides (website URLs set by tourism admin)
        // on top of the API data (from GMS), then sort for stable pagination.
        const merged = mergeLocalUpdates(data.hotels || [])
        merged.sort((a, b) => a.name.localeCompare(b.name))
        setHotels(merged)
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load hotels'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  // Deep link support: /hotels?page=2 (read once on mount, client-side only).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search)
    const p = parseInt(q.get('page') || '1', 10)
    if (Number.isFinite(p) && p > 1) setPage(p)
  }, [])

  const totalPages = Math.max(1, Math.ceil(hotels.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageHotels = hotels.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function goTo(p: number) {
    const clamped = Math.max(1, Math.min(totalPages, p))
    setPage(clamped)
    // Keep the URL shareable without triggering a Next.js navigation.
    window.history.replaceState(null, '', clamped === 1 ? '/hotels' : `/hotels?page=${clamped}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <span className="mx-1.5">/</span>
            <span className="text-foreground">Hotels</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">All Hotels in Bishoftu</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Every approved accommodation on the platform — resorts, hotels, motels and lodges
            across all sub-cities, with live availability from the Guesthouse Management System
            where connected.
          </p>
          {!loading && !error && (
            <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">
              Showing {pageHotels.length} of {hotels.length} hotels
              {totalPages > 1 && <> — page {safePage} of {totalPages}</>}
            </p>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <SearchX className="h-10 w-10 mx-auto text-destructive mb-3" />
            <p className="font-medium">Could not load hotels</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={load}>Try again</Button>
          </div>
        )}

        {/* Loading state */}
        {loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(PAGE_SIZE)].map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && hotels.length === 0 && (
          <div className="rounded-xl border bg-muted/30 p-12 text-center">
            <BedDouble className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="font-medium">No hotels are registered yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Accommodations will appear here once the Tourism Office approves them.
            </p>
          </div>
        )}

        {/* Hotel grid */}
        {!loading && !error && hotels.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageHotels.map((h) => (
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
                    <h2 className="text-lg font-semibold leading-snug line-clamp-1">
                      <Link href={`/hotel/${h.id}`} className="hover:text-primary">{h.name}</Link>
                    </h2>
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
                    {h.website ? (
                      <Button size="sm" variant="outline" className="gap-1.5" asChild>
                        <a
                          href={h.website.startsWith('http') ? h.website : `https://${h.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          Visit Website
                        </a>
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5" asChild>
                        <Link href={`/hotel/${h.id}`}>
                          <ArrowRight className="h-3.5 w-3.5" />
                          View Hotel
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={safePage > 1 ? `/hotels?page=${safePage - 1}` : '#'}
                      aria-disabled={safePage <= 1}
                      className={safePage <= 1 ? 'pointer-events-none opacity-50' : ''}
                      onClick={(e) => { if (safePage > 1) { e.preventDefault(); goTo(safePage - 1) } }}
                    />
                  </PaginationItem>
                  {pageNumbers(safePage, totalPages).map((n, i) => (
                    <PaginationItem key={n === 'ellipsis' ? `e${i}` : n}>
                      {n === 'ellipsis' ? (
                        <PaginationEllipsis />
                      ) : (
                        <PaginationLink
                          href={`/hotels?page=${n}`}
                          isActive={n === safePage}
                          onClick={(e) => { e.preventDefault(); goTo(n) }}
                        >
                          {n}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href={safePage < totalPages ? `/hotels?page=${safePage + 1}` : '#'}
                      aria-disabled={safePage >= totalPages}
                      className={safePage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                      onClick={(e) => { if (safePage < totalPages) { e.preventDefault(); goTo(safePage + 1) } }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Back to home */}
        <div className="mt-12 text-center">
          <Button variant="ghost" className="gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Bishoftu Tourism home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
