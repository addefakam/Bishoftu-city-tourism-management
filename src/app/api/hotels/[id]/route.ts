import { NextResponse } from 'next/server'
import { store } from '@/lib/data'

export const dynamic = 'force-dynamic'

/**
 * PUT /api/hotels/[id]
 * 
 * Allows the tourism office admin to update hotel fields managed by the TMS:
 * - website (hotel's external website URL for advertising)
 * - imageUrl (hotel photo URL)
 * - description (override description)
 * - phone (override phone)
 * 
 * These are TMS-local overrides — they don't affect the GMS data.
 * Stored in the hotel-updates localStorage (same pattern as hotel-store.ts).
 * 
 * When /api/hotels returns hotel data, these overrides are merged on top
 * of the GMS data.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    
    // Only allow specific fields to be updated
    const allowedFields = ['website', 'imageUrl', 'description', 'phone', 'email']
    const update: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        update[field] = body[field]
      }
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    // Store the update — this is a server-side endpoint but the data
    // needs to persist. Since the TMS uses localStorage (client-side),
    // we return the update and the client applies it.
    // In a production system, this would write to a database.
    return NextResponse.json({ success: true, id, update })
  } catch {
    return NextResponse.json({ error: 'Failed to update hotel' }, { status: 500 })
  }
}
