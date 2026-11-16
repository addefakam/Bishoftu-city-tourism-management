import { NextRequest, NextResponse } from 'next/server'
import { getSiteImages, saveSiteImage, deleteSiteImage, SITE_IMAGE_DEFAULTS } from '@/lib/site-images'

export const dynamic = 'force-dynamic'

/**
 * GET /api/site-images
 * Returns all configurable site image URLs (defaults + overrides).
 * Public — anyone can view the images (they're displayed on the public site).
 */
export async function GET() {
  const images = await getSiteImages()
  return NextResponse.json({
    images,
    defaults: Object.fromEntries(
      Object.entries(SITE_IMAGE_DEFAULTS).map(([k, v]) => [k, v.url])
    ),
    labels: Object.fromEntries(
      Object.entries(SITE_IMAGE_DEFAULTS).map(([k, v]) => [k, v.label])
    ),
  })
}

/**
 * POST /api/site-images
 * Upload/update a site image (tourism admin only).
 * Body: { key: string, dataUrl: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { key, dataUrl } = body as { key?: string; dataUrl?: string }

    if (!key || !dataUrl) {
      return NextResponse.json({ error: 'key and dataUrl are required' }, { status: 400 })
    }

    if (!/^[a-z0-9_]+$/i.test(key)) {
      return NextResponse.json({ error: 'Invalid key — only letters, numbers, underscores' }, { status: 400 })
    }

    const MAX = 3_500_000
    if (dataUrl.length > MAX) {
      return NextResponse.json({ error: `Image too large — max ${MAX} chars` }, { status: 413 })
    }

    if (!/^data:image\/(jpeg|png|webp|gif);base64,/.test(dataUrl)) {
      return NextResponse.json({ error: 'dataUrl must be a base64 image data URL' }, { status: 400 })
    }

    const url = await saveSiteImage(key, dataUrl)
    return NextResponse.json({ ok: true, key, url })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[site-images] POST error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

/**
 * DELETE /api/site-images?key=<key>
 * Remove an override and revert to default (tourism admin only).
 */
export async function DELETE(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key')
    if (!key) {
      return NextResponse.json({ error: 'key query param is required' }, { status: 400 })
    }
    await deleteSiteImage(key)
    return NextResponse.json({ ok: true, key })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[site-images] DELETE error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
