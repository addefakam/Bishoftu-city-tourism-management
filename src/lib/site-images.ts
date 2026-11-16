import { put, list, del } from '@vercel/blob'
import { db } from '@/lib/db'

// ─────────────────────────────────────────────────────────────────────
// Site Images Store
// ─────────────────────────────────────────────────────────────────────
// Lets the tourism admin replace hardcoded photos across the site
// (hero background, virtual Bishoftu featured destination, attraction
// cards, etc.) with uploaded images.
//
// Two storage backends (same pattern as photo-store.ts):
// - Vercel Blob (serverless): BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID
// - SQLite SiteImage table (local dev): base64 data URL
//
// Image keys are stable identifiers consumed by the frontend:
//   "hero_background"      → hero section full-bleed image
//   "virtual_bishoftu"     → "See Bishoftu Before You Arrive" card image
//   "attraction_<id>"      → per-attraction card image override
// ─────────────────────────────────────────────────────────────────────

const BLOB_PREFIX = 'site-images/'
const DEFAULT_HERO = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80'
const DEFAULT_VIRTUAL = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80'

export const SITE_IMAGE_DEFAULTS: Record<string, { url: string; label: string }> = {
  hero_background: { url: DEFAULT_HERO, label: 'Home Screen — Hero Background' },
  virtual_bishoftu: { url: DEFAULT_VIRTUAL, label: 'Featured Destination — Lake Hora / Virtual Bishoftu' },
}

export const hasBlobStorage = () =>
  !!process.env.BLOB_READ_WRITE_TOKEN || !!process.env.BLOB_STORE_ID

/**
 * Save a site image (uploaded by tourism admin) and return its URL.
 */
export async function saveSiteImage(key: string, dataUrl: string): Promise<string> {
  if (hasBlobStorage()) {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    const bytes = Buffer.from(base64, 'base64')
    const blob = await put(`site-images/${key}.jpg`, bytes, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/jpeg',
    })
    return blob.url
  }

  if (!db.siteImage) {
    throw new Error(
      "The server's Prisma client is out of date (SiteImage model missing) — run \"npx prisma generate\" and restart."
    )
  }
  const saved = await db.siteImage.upsert({
    where: { key },
    update: { url: dataUrl },
    create: { key, url: dataUrl, label: SITE_IMAGE_DEFAULTS[key]?.label ?? key },
  })
  return saved.url
}

/**
 * Delete a site image override (revert to default).
 */
export async function deleteSiteImage(key: string): Promise<void> {
  if (hasBlobStorage()) {
    // Blob mode: delete from Blob only (SQLite is read-only on serverless)
    try {
      await del(`site-images/${key}.jpg`)
    } catch { /* ignore — may not exist */ }
    return
  }
  // SQLite mode: delete from the database
  if (db.siteImage) {
    await db.siteImage.deleteMany({ where: { key } }).catch(() => {/* ignore read-only errors */})
  }
}

/**
 * Get ALL site image overrides as a map: key → url.
 * Falls back to defaults for any key without an override.
 */
export async function getSiteImages(): Promise<Record<string, string>> {
  const result: Record<string, string> = {}

  // Start with defaults
  for (const [key, val] of Object.entries(SITE_IMAGE_DEFAULTS)) {
    result[key] = val.url
  }

  if (hasBlobStorage()) {
    try {
      const res = await list({ prefix: BLOB_PREFIX })
      for (const b of res.blobs) {
        const key = b.pathname.slice(BLOB_PREFIX.length).replace(/\.jpg$/, '')
        if (key) result[key] = b.url
      }
    } catch { /* fall back to defaults */ }
  } else if (db.siteImage) {
    try {
      const rows = await db.siteImage.findMany()
      for (const r of rows) result[r.key] = r.url
    } catch { /* fall back to defaults */ }
  }

  return result
}

/**
 * Get a single site image URL by key (falls back to default).
 */
export async function getSiteImage(key: string): Promise<string> {
  const all = await getSiteImages()
  return all[key] ?? SITE_IMAGE_DEFAULTS[key]?.url ?? ''
}
