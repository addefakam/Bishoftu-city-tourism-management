import { NextResponse } from 'next/server'
import { isGmsConfigured, checkAvailability } from '@/lib/gms-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/gms-rooms/available?checkIn=2026-12-01&checkOut=2026-12-03&providerId=xxx
 * Checks room availability for a specific hotel + date range from the GMS.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const checkIn = searchParams.get('checkIn')
  const checkOut = searchParams.get('checkOut')
  const providerId = searchParams.get('providerId') || undefined

  if (!isGmsConfigured()) {
    return NextResponse.json({ rooms: [], source: 'static' })
  }

  if (!checkIn || !checkOut) {
    return NextResponse.json({ error: 'checkIn and checkOut are required' }, { status: 400 })
  }

  try {
    const res = await checkAvailability({ checkIn, checkOut, providerId })
    return NextResponse.json({ rooms: res.data || [], source: 'gms' })
  } catch (err) {
    console.error('[gms-rooms/available] Fetch failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ rooms: [], error: 'Failed to check availability' }, { status: 500 })
  }
}
