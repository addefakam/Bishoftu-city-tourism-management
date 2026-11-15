import { NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { isGmsConfigured, getProviders, getRooms } from '@/lib/gms-client'

export const dynamic = 'force-dynamic'

export async function GET() {
  // If GMS is configured, calculate stats from live GMS data
  if (isGmsConfigured()) {
    try {
      return await getStatsFromGms()
    } catch (err) {
      console.error('[stats] GMS fetch failed, falling back to static:', err instanceof Error ? err.message : err)
    }
  }

  // Fallback: static data
  const hotels = store.hotels.findMany()
  const attractions = store.attractions.count()
  const businesses = store.businesses.count()

  const totalRooms = hotels.reduce((s, h) => s + h.totalRooms, 0)
  const occupiedRooms = hotels.reduce((s, h) => s + h.occupiedRooms, 0)
  const availableRooms = totalRooms - occupiedRooms
  const cityOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0

  const topHotels = hotels
    .map((h) => ({
      ...h,
      occupancy: h.totalRooms > 0 ? Math.round((h.occupiedRooms / h.totalRooms) * 1000) / 10 : 0,
      availableRooms: h.totalRooms - h.occupiedRooms,
    }))
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 5)

  const typeMap = new Map<string, number>()
  for (const h of hotels) typeMap.set(h.type, (typeMap.get(h.type) ?? 0) + 1)
  const byType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }))

  const subCityMap = new Map<string, number>()
  for (const h of hotels) subCityMap.set(h.subCity, (subCityMap.get(h.subCity) ?? 0) + 1)
  const bySubCity = Array.from(subCityMap.entries())
    .map(([subCity, count]) => ({ subCity, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({
    registeredHotels: hotels.length,
    totalRooms,
    availableRooms,
    currentGuests: occupiedRooms,
    cityOccupancy,
    topHotels,
    byType,
    bySubCity,
    attractionsCount: attractions,
    businessesCount: businesses,
  })
}

/**
 * Calculate stats from live GMS data.
 */
async function getStatsFromGms() {
  const providersRes = await getProviders({ limit: 100 })
  const roomsRes = await getRooms({ limit: 100 })

  const hotels = providersRes.data
  const rooms = roomsRes.data

  const totalRooms = rooms.length
  const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED').length
  const availableRooms = rooms.filter(r => r.status === 'AVAILABLE').length
  const currentGuests = occupiedRooms // approximate
  const cityOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0

  // Group rooms by provider for per-hotel stats
  const roomsByProvider = new Map<string, typeof rooms>()
  for (const room of rooms) {
    const pid = room.provider?.id || (room as any).providerId
    if (!pid) continue
    if (!roomsByProvider.has(pid)) roomsByProvider.set(pid, [])
    roomsByProvider.get(pid)!.push(room)
  }

  const topHotels = hotels.map(h => {
    const hotelRooms = roomsByProvider.get(h.id) || []
    const occ = hotelRooms.filter(r => r.status === 'OCCUPIED').length
    const total = hotelRooms.length
    return {
      id: h.id,
      name: h.name,
      type: h.type || 'Guest House',
      subCity: h.subCity || 'Bishoftu',
      totalRooms: total,
      occupiedRooms: occ,
      availableRooms: total - occ,
      occupancy: total > 0 ? Math.round((occ / total) * 1000) / 10 : 0,
      pricePerNight: hotelRooms.length > 0 ? Math.min(...hotelRooms.map(r => r.pricePerNight)) : null,
      phone: h.phone || null,
    }
  }).sort((a, b) => b.occupancy - a.occupancy).slice(0, 5)

  // By type
  const typeMap = new Map<string, number>()
  for (const h of hotels) {
    const type = h.type?.includes('HOTEL') ? 'Hotel' :
                 h.type?.includes('RESORT') ? 'Resort' : 'Guest House'
    typeMap.set(type, (typeMap.get(type) ?? 0) + 1)
  }
  const byType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }))

  // By sub-city
  const subCityMap = new Map<string, number>()
  for (const h of hotels) {
    const sc = h.subCity || 'Unknown'
    subCityMap.set(sc, (subCityMap.get(sc) ?? 0) + 1)
  }
  const bySubCity = Array.from(subCityMap.entries())
    .map(([subCity, count]) => ({ subCity, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({
    registeredHotels: hotels.length,
    totalRooms,
    availableRooms,
    currentGuests,
    cityOccupancy,
    topHotels,
    byType,
    bySubCity,
    source: 'gms',
  })
}
