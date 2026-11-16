import { NextResponse } from 'next/server'
import { isGmsConfigured, getRooms } from '@/lib/gms-client'

export const dynamic = 'force-dynamic'

/**
 * GET /api/gms-rooms?hotelId=xxx
 * Fetches rooms for a specific hotel from the GMS.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const hotelId = searchParams.get('hotelId')

  if (!isGmsConfigured()) {
    return NextResponse.json({ rooms: [], source: 'static' })
  }

  try {
    const res = await getRooms({ providerId: hotelId || undefined, limit: 100 })
    return NextResponse.json({ rooms: res.data || [], source: 'gms' })
  } catch (err) {
    console.error('[gms-rooms] Fetch failed:', err instanceof Error ? err.message : err)
    return NextResponse.json({ rooms: [], error: 'Failed to fetch rooms' }, { status: 500 })
  }
}
