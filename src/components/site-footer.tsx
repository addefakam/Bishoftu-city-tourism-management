'use client'

import Link from 'next/link'
import { Waves, Hotel as HotelIcon, Building2, MapPin, Phone, Mail } from 'lucide-react'

const hotelPortal = [
  { label: 'Hotel Login', href: '#' },
  { label: 'Guest Login', href: '#' },
  { label: 'Register Hotel', href: '#' },
  { label: 'Register Business', href: '#' },
  { label: 'Service Directory', href: '#' },
]

const tourismPortal = [
  { label: 'Virtual Bishoftu', href: '#virtual' },
  { label: 'Tourism Login', href: '#' },
  { label: 'Tourism Registration', href: '#' },
  { label: 'Police Login', href: '#' },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="#home" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Waves className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-semibold">Bishoftu Tourism</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Lake City · Oromia</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              The complete, secure tourism &amp; hospitality management solution for modern lakeside destinations. Streamline operations, delight guests, and ensure full compliance.
            </p>
          </div>

          {/* Hotel portal */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">Hotel Portal</p>
            <ul className="space-y-2 text-sm">
              {hotelPortal.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <HotelIcon className="h-3 w-3 opacity-50" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tourism portal */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">Tourism Portal</p>
            <ul className="space-y-2 text-sm">
              {tourismPortal.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 opacity-50" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">Contact Us</p>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 mt-0.5 shrink-0" /> info@bishoftu.gov.et
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" /> 9141
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" /> +251 22 111 0101
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> Bole Road, Bishoftu, Oromia, Ethiopia
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <p>© 2026 Bishoftu City Tourism Management. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <Link href="#" className="hover:text-primary">Secure Police Portal</Link>
            <span className="opacity-50">|</span>
            <Link href="#" className="hover:text-primary">Hotel Management</Link>
            <span className="opacity-50">|</span>
            <Link href="#" className="hover:text-primary">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
