'use client'

import Link from 'next/link'
import { Building2, FileCheck, Info, Landmark, Clock, ShieldCheck, Globe, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const services = [
  { icon: FileCheck, label: 'Business Registration & Licensing' },
  { icon: TrendingUp, label: 'Investment Facilitation & Permits' },
  { icon: Info, label: 'Tourist Information & Guidance' },
  { icon: Landmark, label: 'Cultural Preservation & Events' },
]

const benefits = [
  { icon: ShieldCheck, label: 'Official City Resources' },
  { icon: Clock, label: '24/7 Support Services' },
  { icon: Globe, label: 'Digital Access to Services' },
  { icon: TrendingUp, label: 'Business Growth Support' },
]

export function AboutSection() {
  return (
    <section id="about" className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-0 bg-primary text-primary-foreground">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <CardContent className="p-8 sm:p-10 lg:p-12">
              <p className="text-xs uppercase tracking-[0.2em] text-primary-foreground/80 font-semibold">
                Official City Tourism Partner
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">
                About Bishoftu City Culture &amp; Tourism Office
              </h2>
              <p className="mt-4 text-primary-foreground/90 leading-relaxed">
                Your gateway to doing business and discovering the best of Bishoftu. We provide official information,
                support services, and digital resources for hotels, traders, tourists, and residents.
              </p>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/70 font-semibold mb-3">Our Services</p>
                <ul className="space-y-2">
                  {services.map((s) => (
                    <li key={s.label} className="flex items-center gap-2 text-sm">
                      <s.icon className="h-4 w-4 shrink-0 text-primary-foreground/80" />
                      {s.label}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-wider text-primary-foreground/70 font-semibold mb-3">Benefits</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {benefits.map((b) => (
                    <li key={b.label} className="flex items-center gap-2 text-sm">
                      <b.icon className="h-4 w-4 shrink-0 text-primary-foreground/80" />
                      {b.label}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 text-sm text-primary-foreground/80 italic">
                Supporting lakeside tourism, trade facilitation, and sustainable cultural heritage in Bishoftu City since its establishment.
              </p>
            </CardContent>

            {/* Right side - contact card */}
            <CardContent className="bg-primary-foreground/5 p-8 sm:p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-primary-foreground/10">
              <div className="rounded-2xl bg-primary-foreground/10 backdrop-blur p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/15">
                    <Building2 className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Contact</p>
                    <p className="font-semibold">Bishoftu Tourism Office</p>
                  </div>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-primary-foreground/70">Email</dt>
                    <dd>info@bishoftu.gov.et</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-primary-foreground/70">Hotline</dt>
                    <dd>9141</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-primary-foreground/70">Office</dt>
                    <dd>+251 22 111 0101</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-primary-foreground/70">Address</dt>
                    <dd className="text-right">Bole Road, Bishoftu, Oromia</dd>
                  </div>
                </dl>
                <Button asChild variant="secondary" className="mt-6 w-full gap-2">
                  <Link href="#contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    </section>
  )
}
