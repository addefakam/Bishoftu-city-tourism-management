import { NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { getMergedHotels } from '@/lib/hotel-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Use merged hotels (static + any hotel-manager updates from localStorage)
  // Note: localStorage is per-browser; on the server this returns static data.
  // For a real multi-user system, this would read from a shared database.
  const hotels = typeof window === 'undefined' ? store.hotels.findMany() : getMergedHotels()
  return NextResponse.json({ hotels })
}
