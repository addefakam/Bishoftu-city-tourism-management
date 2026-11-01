'use client'

import { Waves, Bird, Plane, Sparkles } from 'lucide-react'

const pillars = [
  {
    icon: Waves,
    title: 'Crater Lakes & Hot Springs',
    body: 'Seven volcanic crater lakes — Bishoftu, Hora, Babiogaya, Kuriftu, Kilole, Meskel, and Green Lake — plus nearby Sodre hot springs for wellness getaways.',
    tags: ['Lakes', 'Hot Springs'],
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Bird,
    title: 'Rift Valley Birdlife & Wetlands',
    body: 'Cheleleka Wetland hosts flamingos, pelicans, and migratory waterfowl — a recognized Important Bird Area minutes from the city center.',
    tags: ['Birdwatching', 'Wetland'],
    color: 'bg-emerald-500/10 text-emerald-700',
  },
  {
    icon: Sparkles,
    title: 'Culture & Irecha Festival',
    body: 'Lake Hora is the spiritual heart of the Oromo Irecha thanksgiving — Ethiopia’s largest cultural celebration, held each September.',
    tags: ['Irecha', 'Oromo Culture'],
    color: 'bg-amber-500/10 text-amber-700',
  },
  {
    icon: Plane,
    title: 'Aviation Heritage',
    body: 'Bishoftu is home to the Ethiopian Air Force and its aviation museum — chronicling a century of Ethiopian military and civil flight.',
    tags: ['Air Force', 'Museum'],
    color: 'bg-rose-500/10 text-rose-700',
  },
]

export function WhyBishoftuSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">Why Bishoftu</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
            Oromia&apos;s City of Lakes & Culture
          </h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Just 47 km from Addis Ababa along the expressway, Bishoftu is Ethiopia&apos;s most accessible lake resort destination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border bg-card p-6 hover:shadow-md transition-shadow hover:-translate-y-1 transition-transform duration-200"
            >
              <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${p.color} mb-4`}>
                <p.icon className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-semibold leading-snug">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.tags.map((t) => (
                  <span key={t} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
