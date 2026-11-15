import { NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { getMergedHotels } from '@/lib/hotel-store'
import { isGmsConfigured, getProviders, getRooms } from '@/lib/gms-client'
import type { Hotel } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  // If GMS is configured, fetch live accommodation data from the GMS API.
  // This replaces the static JSON data with real-time data from the
  // Guesthouse Management System.
  if (isGmsConfigured()) {
    try {
      return await getHotelsFromGms()
    } catch (err) {
      console.error('[hotels] GMS fetch failed, falling back to static data:', err instanceof Error ? err.message : err)
      // Fall through to static data below
    }
  }

  // Fallback: static data (when GMS is not configured or fetch failed)
  const hotels = typeof window === 'undefined' ? store.hotels.findMany() : getMergedHotels()
  return NextResponse.json({ hotels })
}

/**
 * Fetches hotels from the GMS API and maps them to the TMS Hotel interface.
 * The GMS returns Provider records (guesthouses) + Room records.
 * We merge them to create the TMS Hotel shape.
 */
async function getHotelsFromGms() {
  // Fetch all approved providers
  const providersRes = await getProviders({ limit: 100 })

  // Fetch rooms for all providers (one call)
  const roomsRes = await getRooms({ limit: 100 })

  // Group rooms by providerId
  const roomsByProvider = new Map<string, typeof roomsRes.data>()
  for (const room of roomsRes.data) {
    const pid = room.provider?.id || (room as any).providerId
    if (!pid) continue
    if (!roomsByProvider.has(pid)) roomsByProvider.set(pid, [])
    roomsByProvider.get(pid)!.push(room)
  }

  // Map GMS providers to TMS Hotel format
  const hotels: Hotel[] = providersRes.data.map((p) => {
    const rooms = roomsByProvider.get(p.id) || []
    const totalRooms = rooms.length
    const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length
    const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').length

    // Find the cheapest room price for display
    const prices = rooms.map(r => r.pricePerNight).filter(Boolean)
    const minPrice = prices.length > 0 ? Math.min(...prices) : null

    // Merge TMS-local overrides (website, imageUrl set by tourism admin)
    const localOverride = getLocalOverride(p.id)

    return {
      id: p.id,
      name: p.name || 'Unknown',
      description: p.type || 'Guesthouse',
      starRating: inferStarRating(p.type, p.bedCount, rooms),
      type: mapGmsTypeToTmsType(p.type),
      subCity: p.subCity || 'Bishoftu',
      address: p.address || 'Bishoftu',
      pricePerNight: minPrice,
      totalRooms,
      occupiedRooms,
      imageUrl: localOverride.imageUrl || null,
      phone: p.phone || null,
      email: null,
      website: localOverride.website || null,
      featured: totalRooms > 0,
    }
  })

  return NextResponse.json({ hotels, source: 'gms' })
}

/**
 * Get TMS-local overrides for a hotel (website, image, etc.)
 * These are set by the tourism office admin and stored server-side.
 * In a production system, this would read from a database.
 * For now, returns empty (no overrides) — the tourism admin sets
 * these via the client-side hotel-store which merges in the browser.
 */
function getLocalOverride(_hotelId: string): { website?: string; imageUrl?: string } {
  return {}
}

/**
 * Infers a star rating (1-5) from GMS provider data.
 * GMS doesn't have explicit star ratings, so we estimate based on:
 * - Provider type (RESORT > HOTEL > GUEST_HOUSE)
 * - Bed count (larger = more likely higher-tier)
 * - Room pricing (higher price = higher tier)
 */
function inferStarRating(type?: string, bedCount?: number, rooms?: any[]): number {
  const t = (type || '').toUpperCase()
  
  // Base rating by type
  let rating = 3
  if (t.includes('RESORT')) rating = 5
  else if (t.includes('HOTEL')) rating = 4
  else if (t.includes('GUEST')) rating = 3
  else if (t.includes('LODGE')) rating = 3

  // Adjust by bed count (larger properties tend to be higher tier)
  if (bedCount && bedCount >= 50) rating = Math.max(rating, 4)
  if (bedCount && bedCount >= 100) rating = 5

  // Adjust by average room price (higher price = higher tier)
  if (rooms && rooms.length > 0) {
    const avgPrice = rooms.reduce((s, r) => s + (r.pricePerNight || 0), 0) / rooms.length
    if (avgPrice >= 2000) rating = Math.max(rating, 5)
    else if (avgPrice >= 1000) rating = Math.max(rating, 4)
  }

  return Math.min(5, Math.max(1, rating))
}

function mapGmsTypeToTmsType(gmsType?: string): string {
  if (!gmsType) return 'Guest House'
  const t = gmsType.toUpperCase()
  if (t.includes('HOTEL')) return 'Hotel'
  if (t.includes('RESORT')) return 'Resort'
  if (t.includes('GUEST')) return 'Guest House'
  if (t.includes('LODGE')) return 'Lodge'
  return 'Guest House'
}
