import { db } from '@/lib/db'

// ─────────────────────────────────────────────────────────────────────
// Site Settings Store (footer content, link lists, contact info, etc.)
// ─────────────────────────────────────────────────────────────────────
// A simple key/value JSON store used by tourism admins to edit site-wide
// chrome such as the public footer. Currently the only key is "footer".
//
// Storage: SQLite SiteSetting table (key → JSON-encoded value). If the
// server's Prisma client is out of date (model missing) or DB is
// unavailable, all reads fall back to defaults and writes throw — same
// defensive pattern as site-images.ts.
// ─────────────────────────────────────────────────────────────────────

export interface FooterLink {
  label: string
  href: string
}

export interface FooterSettings {
  brandName: string
  brandTagline: string
  brandDescription: string
  hotelPortalTitle: string
  hotelPortal: FooterLink[]
  tourismPortalTitle: string
  tourismPortal: FooterLink[]
  contactTitle: string
  email: string
  phonePrimary: string
  phoneSecondary: string
  address: string
  copyright: string
  bottomLinks: FooterLink[]
}

// The defaults mirror the original hardcoded footer in site-footer.tsx
// so existing pages render identically until an admin edits the content.
export const FOOTER_DEFAULTS: FooterSettings = {
  brandName: 'Bishoftu Tourism',
  brandTagline: 'Lake City · Oromia',
  brandDescription:
    'The complete, secure tourism & hospitality management solution for modern lakeside destinations. Streamline operations, delight guests, and ensure full compliance.',
  hotelPortalTitle: 'Hotel Portal',
  hotelPortal: [
    { label: 'Hotel Login', href: '#' },
    { label: 'Guest Login', href: '#' },
    { label: 'Register Hotel', href: '#' },
    { label: 'Register Business', href: '#' },
    { label: 'Service Directory', href: '#' },
  ],
  tourismPortalTitle: 'Tourism Portal',
  tourismPortal: [
    { label: 'Virtual Bishoftu', href: '#virtual' },
    { label: 'Tourism Login', href: '#' },
    { label: 'Tourism Registration', href: '#' },
    { label: 'Police Login', href: '#' },
  ],
  contactTitle: 'Contact Us',
  email: 'info@bishoftu.gov.et',
  phonePrimary: '9141',
  phoneSecondary: '+251 22 111 0101',
  address: 'Bole Road, Bishoftu, Oromia, Ethiopia',
  copyright: '© 2026 Bishoftu City Tourism Management. All rights reserved.',
  bottomLinks: [
    { label: 'Secure Police Portal', href: '#' },
    { label: 'Hotel Management', href: '#' },
    { label: 'Privacy', href: '#' },
  ],
}

const FOOTER_KEY = 'footer'

/**
 * Read the saved footer settings, merged over the defaults so any field
 * the admin hasn't customized falls back to its default value.
 */
export async function getFooterSettings(): Promise<FooterSettings> {
  if (!db.siteSetting) return FOOTER_DEFAULTS
  try {
    const row = await db.siteSetting.findUnique({ where: { key: FOOTER_KEY } })
    if (!row) return FOOTER_DEFAULTS
    const parsed = JSON.parse(row.value) as Partial<FooterSettings>
    return {
      ...FOOTER_DEFAULTS,
      ...parsed,
      // Ensure link arrays are always present & well-formed even if the
      // saved JSON predates a field addition.
      hotelPortal: Array.isArray(parsed.hotelPortal) ? parsed.hotelPortal : FOOTER_DEFAULTS.hotelPortal,
      tourismPortal: Array.isArray(parsed.tourismPortal) ? parsed.tourismPortal : FOOTER_DEFAULTS.tourismPortal,
      bottomLinks: Array.isArray(parsed.bottomLinks) ? parsed.bottomLinks : FOOTER_DEFAULTS.bottomLinks,
    }
  } catch {
    return FOOTER_DEFAULTS
  }
}

/**
 * Persist the full footer settings object as JSON. Returns the saved value.
 */
export async function saveFooterSettings(value: FooterSettings): Promise<FooterSettings> {
  if (!db.siteSetting) {
    throw new Error(
      "The server's Prisma client is out of date (SiteSetting model missing) — run \"npx prisma generate\" and restart."
    )
  }
  const json = JSON.stringify(value)
  await db.siteSetting.upsert({
    where: { key: FOOTER_KEY },
    update: { value: json },
    create: { key: FOOTER_KEY, value: json },
  })
  return value
}
