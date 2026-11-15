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
    const raw = err instanceof Error ? err.message : String(err)
    console.error('[hotel-photo] upload failed:', raw)
    // Surface the real cause so the UI can show it instead of a generic
    // "Failed to save photo". Known Prisma/SQLite failure modes get a
    // short actionable hint; anything else is shown verbatim.
    let detail = raw
    if (/readonly|read-only|eaccess|eacces|cantopen|permission/i.test(raw)) {
      detail = 'the photo database is read-only here — SQLite cannot persist writes on serverless hosts (deploy with an external database or run locally)'
    } else if (/P2021|does not exist in the current database/i.test(raw)) {
      detail = 'the TouristPhoto table is missing — run "npx prisma db push" against this DATABASE_URL'
    } else if (/P1003|database.*does not exist|unable to open/i.test(raw)) {
      detail = 'the database file is missing — check DATABASE_URL in .env'
    } else if (/P2002/i.test(raw)) {
      detail = 'a photo row for this hotel already exists (unique constraint)'
    }
    return NextResponse.json({ error: `Failed to save photo: ${detail}` }, { status: 500 })
  }
}
