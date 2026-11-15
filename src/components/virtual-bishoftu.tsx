'use client'

import Link from 'next/link'
import { Waves, Mountain, CalendarDays, ImageIcon, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const overviewStats = [
  { value: 9, label: 'Destinations' },
  { value: 4, label: 'Lakes' },
  { value: 1, label: 'Upcoming Event' },
]

export function VirtualBishoftuSection() {
  return (
    <section id="virtual" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-0">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image side */}
            <div className="relative min-h-[280px] lg:min-h-[420px]">
              <img
                src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80"
                alt="Lake Hora — Bishoftu"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-3">
                <div className="text-white">
                  <p className="text-xs uppercase tracking-wider text-white/80">Featured destination</p>
                  <p className="text-xl font-semibold">Lake Hora — Irecha Festival Ground</p>
                </div>
                <Button asChild size="sm" variant="secondary" className="gap-1.5 shrink-0">
                  <Link href="#attractions">
                    360° Tour <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Text side */}
            <CardContent className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Discover Virtual Bishoftu</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                See Bishoftu Before You Arrive
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Explore attractions, lakes, culture, festivals, and 360° virtual tours through our interactive tourism hub — an immersive preview of everything Bishoftu has to offer.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-3">
                {overviewStats.map((s) => (
                  <div key={s.label} className="rounded-xl bg-secondary/60 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{s.value}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  <Waves className="h-3.5 w-3.5 text-primary" /> Crater Lakes
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  <Mountain className="h-3.5 w-3.5 text-primary" /> Crater Rim Trail
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" /> Irecha Festival
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" /> Photo Gallery
                </span>
              </div>

              <Button asChild size="lg" className="mt-8 gap-2 w-full sm:w-auto">
                <Link href="#attractions">
                  Explore Virtual Bishoftu <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  )
}
