import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GMS_API_URL = process.env.GMS_API_URL || ''
const GMS_API_KEY = process.env.GMS_API_KEY || ''

/**
 * GET /api/hotel-overrides
 * Fetches hotel website overrides from the GMS (server-side persistence).
 */
export async function GET() {
  if (!GMS_API_URL || !GMS_API_KEY) {
    return NextResponse.json({ overrides: {} })
  }

  try {
    const res = await fetch(`${GMS_API_URL}/api/v1/hotel-overrides`, {
      headers: { 'x-api-key': GMS_API_KEY },
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json({ overrides: data.data || {} })
  } catch {
    return NextResponse.json({ overrides: {} })
  }
}

/**
 * PUT /api/hotel-overrides
 * Saves hotel website overrides to the GMS (server-side persistence).
 * Called by the tourism admin dashboard when they set website URLs.
 *
 * Body: { "hotel_id": { "website": "https://..." }, ... }
 */
export async function PUT(req: Request) {
  if (!GMS_API_URL || !GMS_API_KEY) {
    return NextResponse.json({ error: 'GMS not configured' }, { status: 500 })
  }

  try {
    const body = await req.json()
    const res = await fetch(`${GMS_API_URL}/api/v1/hotel-overrides`, {
      method: 'PUT',
      headers: {
        'x-api-key': GMS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json({ success: true, overrides: data.data || body })
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
