import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const hotels = await db.hotel.findMany()
  const attractions = await db.attraction.count()
  const businesses = await db.business.count()

  const totalRooms = hotels.reduce((s, h) => s + h.totalRooms, 0)
  const occupiedRooms = hotels.reduce((s, h) => s + h.occupiedRooms, 0)
  const availableRooms = totalRooms - occupiedRooms
  const cityOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 1000) / 10 : 0

  // Top performing hotels (by occupancy rate)
  const topHotels = hotels
    .map((h) => ({
      ...h,
      occupancy: h.totalRooms > 0 ? Math.round((h.occupiedRooms / h.totalRooms) * 1000) / 10 : 0,
      availableRooms: h.totalRooms - h.occupiedRooms,
    }))
    .sort((a, b) => b.occupancy - a.occupancy)
    .slice(0, 5)

  // Hotels by type
  const typeMap = new Map<string, number>()
  for (const h of hotels) {
    typeMap.set(h.type, (typeMap.get(h.type) ?? 0) + 1)
  }
  const byType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }))

  // Hotels by sub-city
  const subCityMap = new Map<string, number>()
  for (const h of hotels) {
    subCityMap.set(h.subCity, (subCityMap.get(h.subCity) ?? 0) + 1)
  }
  const bySubCity = Array.from(subCityMap.entries())
    .map(([subCity, count]) => ({ subCity, count }))
    .sort((a, b) => b.count - a.count)

  return NextResponse.json({
    registeredHotels: hotels.length,
    totalRooms,
    availableRooms,
    currentGuests: occupiedRooms,
    cityOccupancy,
    attractions,
    businesses: businesses + hotels.length, // 32 registered tourism & hospitality businesses
    topHotels,
    byType,
    bySubCity,
  })
}
