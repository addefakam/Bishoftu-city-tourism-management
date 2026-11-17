import { NextResponse } from 'next/server'
import { getFooterSettings, saveFooterSettings, FOOTER_DEFAULTS, type FooterSettings } from '@/lib/site-settings'

export const dynamic = 'force-dynamic'

/**
 * GET /api/footer-settings
 * Public — returns the live footer content (merged with defaults).
 * Consumed by the SiteFooter component on every public page.
 */
export async function GET() {
  const data = await getFooterSettings()
  return NextResponse.json({ data, defaults: FOOTER_DEFAULTS })
}

/**
 * PUT /api/footer-settings
 * Save the full footer settings object (tourism admin only — the
 * dashboard router only mounts the FooterManager for that role).
 *
 * Body: FooterSettings (see src/lib/site-settings.ts)
 */
export async function PUT(req: Request) {
  try {
    const body = (await req.json()) as Partial<FooterSettings>

    // Basic shape validation — reject obviously malformed payloads early.
    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Invalid body — expected a footer settings object' }, { status: 400 })
    }
    for (const f of ['brandName', 'brandTagline', 'brandDescription', 'hotelPortalTitle', 'tourismPortalTitle', 'contactTitle', 'email', 'phonePrimary', 'phoneSecondary', 'address', 'copyright'] as const) {
      if (body[f] !== undefined && typeof body[f] !== 'string') {
        return NextResponse.json({ error: `Field "${f}" must be a string` }, { status: 400 })
      }
    }
    for (const arr of ['hotelPortal', 'tourismPortal', 'bottomLinks'] as const) {
      if (body[arr] !== undefined) {
        if (!Array.isArray(body[arr])) {
          return NextResponse.json({ error: `Field "${arr}" must be an array` }, { status: 400 })
        }
        for (const item of body[arr]) {
          if (!item || typeof item.label !== 'string' || typeof item.href !== 'string') {
            return NextResponse.json({ error: `Each entry in "${arr}" must have { label, href } strings` }, { status: 400 })
          }
        }
      }
    }

    // Merge with defaults so partial updates don't wipe missing fields.
    const current = await getFooterSettings()
    const merged: FooterSettings = {
      ...current,
      ...body,
      hotelPortal: body.hotelPortal ?? current.hotelPortal,
      tourismPortal: body.tourismPortal ?? current.tourismPortal,
      bottomLinks: body.bottomLinks ?? current.bottomLinks,
    }

    const saved = await saveFooterSettings(merged)
    return NextResponse.json({ ok: true, data: saved })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[footer-settings] PUT error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
