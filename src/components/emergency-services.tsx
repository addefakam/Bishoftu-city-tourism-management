'use client'

import { Shield, Phone, HeartPulse, Flame, Building2, PhoneCall } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const services = [
  { icon: Shield, name: 'Bishoftu City Police', number: '9141', label: 'General' },
  { icon: Phone, name: 'Bishoftu Tourist Police', number: '+251 11 433 0099', label: 'Tourist' },
  { icon: HeartPulse, name: 'National Ambulance Service', number: '902', label: 'Ambulance' },
  { icon: Flame, name: 'Bishoftu Fire Brigade', number: '939', label: 'Fire' },
  { icon: Building2, name: 'Bishoftu Referral Hospital', number: '+251 11 433 1100', label: 'Hospital' },
  { icon: Phone, name: 'Bishoftu Tourism Office', number: '+251 22 111 0101', label: 'Tourism' },
]

export function EmergencyServicesSection() {
  return (
    <section id="contact" className="bg-muted/30 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl sm:text-3xl">Bishoftu City Emergency Services</CardTitle>
            <CardDescription>Tap to call — available 24/7 for visitors and residents.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((s) => (
                <a
                  key={s.name}
                  href={`tel:${s.number.replace(/\s+/g, '')}`}
                  className="group flex items-center gap-4 rounded-xl border bg-card p-4 hover:border-primary hover:shadow-sm transition-all"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-700 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug">{s.name}</p>
                    <p className="text-sm text-muted-foreground tabular-nums">{s.number}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                    {s.label}
                  </span>
                  <PhoneCall className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
