import { NextResponse } from 'next/server'
import { savePhoto, hasBlobStorage } from '@/lib/photo-store'

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
 * data URL, then persisted by @/lib/photo-store: in Vercel Blob when
 * BLOB_READ_WRITE_TOKEN is set (required on serverless hosts, where the
 * filesystem is read-only), otherwise in the TMS SQLite database
 * (TouristPhoto table) for local use. /api/hotels returns it on the hotel
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

    const touristPhotoUrl = await savePhoto(id, dataUrl)

    return NextResponse.json({ success: true, touristPhotoUrl })
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err)
    console.error('[hotel-photo] upload failed:', raw)
    // Surface the real cause so the UI can show it instead of a generic
    // "Failed to save photo". Known failure modes get a short actionable
    // hint; anything else is shown verbatim.
    let detail = raw
    if (/readonly|read-only|eaccess|eacces|cantopen|permission/i.test(raw)) {
      detail = hasBlobStorage()
        ? 'SQLite rejected a write even though the Blob token is visible — this should not happen; open /api/photo-storage-status and report its output'
        : 'this host cannot persist SQLite writes and the BLOB_READ_WRITE_TOKEN is NOT visible to this deployment — open /api/photo-storage-status on this site to see what it actually has; then connect the Blob store to THIS project and redeploy, or add the token manually (Settings → Environment Variables)'
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
