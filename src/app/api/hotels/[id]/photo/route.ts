import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Base64 data URL of the compressed photo. Client-side compression keeps
// typical uploads at ~200–500 KB; the cap allows generous headroom.
const MAX_DATA_URL_LENGTH = 3_500_000
const ALLOWED_IMAGE_TYPES = ['jpeg', 'png', 'webp', 'gif']
const DATA_URL_RE = new RegExp(
  `^data:image/(${ALLOWED_IMAGE_TYPES.join('|')});base64,[A-Za-z0-9+/=]+$`
)
const HOTEL_ID_RE = /^[\w-]{1,100}$/

/**
 * POST /api/hotels/[id]/photo
 *
 * Lets a tourist upload a photo of a hotel from the hotel card on the
 * /hotels page, and lets the tourism admin upload a card image from the
 * dashboard. The image is compressed in the browser and sent as a base64
 * data URL, then stored in the TMS SQLite database (TouristPhoto table)
 * so it survives reloads and logouts. /api/hotels returns it on the hotel
 * as `touristPhotoUrl`, which the cards display above the hotel name.
 *
 * Body: { "dataUrl": "data:image/jpeg;base64,..." }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!HOTEL_ID_RE.test(id)) {
      return NextResponse.json({ error: 'Invalid hotel id' }, { status: 400 })
    }

    const body = await req.json().catch(() => null)
    const dataUrl = body?.dataUrl
    if (typeof dataUrl !== 'string' || !DATA_URL_RE.test(dataUrl)) {
      return NextResponse.json(
        { error: 'Please upload a JPEG, PNG, WebP or GIF image.' },
        { status: 400 }
      )
    }
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      return NextResponse.json({ error: 'Image is too large.' }, { status: 413 })
    }

    const saved = await db.touristPhoto.upsert({
      where: { hotelId: id },
      update: { dataUrl },
      create: { hotelId: id, dataUrl },
    })

    return NextResponse.json({ success: true, touristPhotoUrl: saved.dataUrl })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[hotel-photo] upload failed:', msg)
    // On serverless hosts (e.g. Vercel) the bundled SQLite file is read-only,
    // so writes fail — surface that clearly instead of a generic error.
    const hint = /readonly|read-only/i.test(msg)
      ? ' — photo storage is read-only on this deployment'
      : ''
    return NextResponse.json({ error: `Failed to save photo${hint}` }, { status: 500 })
  }
}
