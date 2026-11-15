'use client'

import { useEffect, useState } from 'react'
import { CalendarDays, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { NewsPost } from '@/lib/types'

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function NewsSection() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => setPosts(data.news))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Stay Informed</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Latest Tourism Updates</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              News, announcements, and upcoming events from Bishoftu&apos;s hotels and tourism office.
            </p>
          </div>
          <Button variant="outline" className="gap-2 shrink-0">
            View All News <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {posts.map((p) => (
              <Card key={p.id} className="flex flex-col hover:shadow-md transition-shadow">
                <CardContent className="p-5 flex-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(p.publishedAt)}
                  </div>
                  <h3 className="mt-3 font-semibold leading-snug line-clamp-2">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">{p.excerpt}</p>
                </CardContent>
                <CardFooter className="p-5 pt-0">
                  <Badge variant="secondary" className="font-medium">
                    {p.hotelName ?? 'Bishoftu Tourism'}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
