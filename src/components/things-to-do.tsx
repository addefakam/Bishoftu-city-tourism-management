'use client'

import { Waves, Bird, Plane, CalendarDays, Mountain, Droplets } from 'lucide-react'

const categories = [
  {
    icon: Waves,
    title: 'Lakes & Water Sports',
    body: 'Kayaking, paddle-boarding, and lakeside relaxation on Lake Kuriftu and Babiogaya — with beach clubs and boat rentals.',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Bird,
    title: 'Bird Watching',
    body: 'Cheleleka Wetland and Lake Babiogaya are top birding spots — flamingos, pelicans, and migratory waterfowl.',
    color: 'bg-emerald-500/10 text-emerald-700',
  },
  {
    icon: Droplets,
    title: 'Hot Springs & Wellness',
    body: 'Natural geothermal springs at Sodre and resort spas fed by mineral-rich volcanic water.',
    color: 'bg-rose-500/10 text-rose-700',
  },
  {
    icon: CalendarDays,
    title: 'Culture & Irecha Festival',
    body: 'Annual Irecha thanksgiving at Lake Hora, plus Oromo music, crafts, and culinary traditions year-round.',
    color: 'bg-amber-500/10 text-amber-700',
  },
  {
    icon: Plane,
    title: 'Air Force Museum',
    body: 'Historic aircraft and aviation heritage chronicling the Ethiopian Air Force, headquartered in Bishoftu.',
    color: 'bg-slate-500/10 text-slate-700',
  },
  {
    icon: Mountain,
    title: 'Crater Rim Hiking',
    body: 'Half-day trail circling the main crater lakes with dramatic cliffside panoramas of the Rift Valley.',
    color: 'bg-orange-500/10 text-orange-700',
  },
]

export function ThingsToDoSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Plan Your Visit</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Things to Do in Bishoftu</h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            From crater-lake kayaking to crater-rim hiking, Bishoftu offers something for every visitor.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((c) => (
            <div
              key={c.title}
              className="flex gap-4 rounded-2xl border bg-card p-5 hover:border-primary/40 hover:shadow-sm transition-all"
            >
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-semibold leading-snug">{c.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
