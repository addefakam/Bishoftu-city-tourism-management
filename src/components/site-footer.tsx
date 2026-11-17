'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Waves, Hotel as HotelIcon, Building2, MapPin, Phone, Mail } from 'lucide-react'
import { FOOTER_DEFAULTS, type FooterSettings } from '@/lib/site-settings'

// Client-side fallback so the first paint is identical to the defaults
// before the fetch from /api/footer-settings resolves.
function useFooterSettings(): FooterSettings {
  const [settings, setSettings] = useState<FooterSettings>(FOOTER_DEFAULTS)
  useEffect(() => {
    let cancelled = false
    fetch('/api/footer-settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data?.data) setSettings({ ...FOOTER_DEFAULTS, ...data.data })
      })
      .catch(() => { /* keep defaults on error */ })
    return () => { cancelled = true }
  }, [])
  return settings
}

export function SiteFooter() {
  const s = useFooterSettings()

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
                <span className="text-sm font-semibold">{s.brandName}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.brandTagline}</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{s.brandDescription}</p>
          </div>

          {/* Hotel portal */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">{s.hotelPortalTitle}</p>
            <ul className="space-y-2 text-sm">
              {s.hotelPortal.map((l, i) => (
                <li key={`${l.label}-${i}`}>
                  <Link href={l.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <HotelIcon className="h-3 w-3 opacity-50" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tourism portal */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">{s.tourismPortalTitle}</p>
            <ul className="space-y-2 text-sm">
              {s.tourismPortal.map((l, i) => (
                <li key={`${l.label}-${i}`}>
                  <Link href={l.href} className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 opacity-50" /> {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-wider text-foreground font-semibold mb-3">{s.contactTitle}</p>
            <ul className="space-y-2.5 text-sm">
              {s.email && (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 mt-0.5 shrink-0" /> {s.email}
                </li>
              )}
              {s.phonePrimary && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" /> {s.phonePrimary}
                </li>
              )}
              {s.phoneSecondary && (
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" /> {s.phoneSecondary}
                </li>
              )}
              {s.address && (
                <li className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" /> {s.address}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-muted-foreground">
          <p>{s.copyright}</p>
          <div className="flex items-center gap-3">
            {s.bottomLinks.map((l, i) => (
              <span key={`${l.label}-${i}`} className="flex items-center gap-3">
                {i > 0 && <span className="opacity-50">|</span>}
                <Link href={l.href} className="hover:text-primary">{l.label}</Link>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export type { FooterSettings }

