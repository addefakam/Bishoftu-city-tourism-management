'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Attraction } from '@/lib/types'

const CATEGORY_LABELS: Record<string, string> = {
  lake: 'Crater Lake',
  wetland: 'Wetland',
  hot_spring: 'Hot Spring',
  museum: 'Museum',
  church: 'Cultural & Historical Site',
  viewpoint: 'Viewpoint',
  park: 'Park & Recreation',
}

const CATEGORY_STYLES: Record<string, string> = {
  lake: 'bg-primary/10 text-primary border-primary/20',
  wetland: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
  hot_spring: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
  museum: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  church: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
  viewpoint: 'bg-orange-500/10 text-orange-700 border-orange-500/20',
  park: 'bg-lime-500/10 text-lime-700 border-lime-500/20',
}

export function FeaturedAttractionsSection() {
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/attractions')
      .then((r) => r.json())
      .then((data) => {
        const list: Attraction[] = data.attractions
        const featured = list.filter((a) => a.featured)
        const others = list.filter((a) => !a.featured)
        setAttractions([...featured, ...others].slice(0, 6))
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section id="attractions" className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">See &amp; Do</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Featured Attractions</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            The landmarks, lakes, and destinations visitors love most in Bishoftu.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((a) => (
              <Card key={a.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative aspect-[16/10] bg-muted overflow-hidden">
                  {a.imageUrl && (
                    <img
                      src={a.imageUrl}
                      alt={a.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )}
                  <Badge
                    variant="outline"
                    className={`absolute top-3 left-3 ${CATEGORY_STYLES[a.category] ?? 'bg-white/90 text-foreground border-white'} backdrop-blur`}
                  >
                    {CATEGORY_LABELS[a.category] ?? a.category}
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-lg font-semibold leading-snug">{a.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed">{a.description}</p>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Button variant="ghost" size="sm" className="gap-1.5 -ml-2 text-primary hover:text-primary">
                    View details <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="#attractions">
              Explore All Attractions <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
