// Hotel data store — allows hotel managers to update their hotel's details.
// Changes are persisted to localStorage and merged with the static JSON data.

import { store as staticStore } from '@/lib/data'
import type { Hotel, NewsPost } from '@/lib/data'

const HOTEL_UPDATES_KEY = 'bishoftu_hotel_updates'
const NEWS_KEY = 'bishoftu_custom_news'

interface HotelUpdate {
  description?: string
  pricePerNight?: number | null
  phone?: string | null
  email?: string | null
  occupiedRooms?: number
  website?: string | null
  imageUrl?: string | null
}

function loadHotelUpdates(): Record<string, HotelUpdate> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(HOTEL_UPDATES_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveHotelUpdates(updates: Record<string, HotelUpdate>) {
  if (typeof window === 'undefined') return
  localStorage.setItem(HOTEL_UPDATES_KEY, JSON.stringify(updates))
}

function loadCustomNews(): NewsPost[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(NEWS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveCustomNews(news: NewsPost[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(NEWS_KEY, JSON.stringify(news))
}

// Get merged hotels (static + local updates)
export function getMergedHotels(): Hotel[] {
  const base = staticStore.hotels.findMany()
  const updates = loadHotelUpdates()
  return base.map((h) => (updates[h.id] ? { ...h, ...updates[h.id] } : h))
}

/**
 * Merge localStorage hotel updates (website, imageUrl, etc.) on top of
 * hotels fetched from the API (GMS data). This is used by client-side
 * components that fetch from /api/hotels but need to apply the tourism
 * admin's local overrides (website URLs, etc.).
 */
export function mergeLocalUpdates(hotels: Hotel[]): Hotel[] {
  const updates = loadHotelUpdates()
  return hotels.map((h) => {
    const update = updates[h.id]
    if (!update) return h
    return {
      ...h,
      ...update,
      // Only override fields that are actually set in the update
      website: update.website !== undefined ? update.website : h.website,
      imageUrl: update.imageUrl !== undefined ? update.imageUrl : h.imageUrl,
      phone: update.phone !== undefined ? update.phone : h.phone,
      email: update.email !== undefined ? update.email : h.email,
      description: update.description !== undefined ? update.description : h.description,
    }
  })
}

export function getMergedHotelById(id: string): Hotel | undefined {
  return getMergedHotels().find((h) => h.id === id)
}

export function updateHotel(hotelId: string, update: HotelUpdate): { ok: boolean; error?: string } {
  const updates = loadHotelUpdates()
  const hotel = staticStore.hotels.findMany().find((h) => h.id === hotelId)
  if (!hotel) return { ok: false, error: 'Hotel not found.' }
  updates[hotelId] = { ...updates[hotelId], ...update }
  saveHotelUpdates(updates)
  return { ok: true }
}

// Get merged news (static + custom)
export function getMergedNews(): NewsPost[] {
  const base = staticStore.news.findMany()
  const custom = loadCustomNews()
  return [...custom, ...base].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function addNews(news: { title: string; excerpt: string; hotelName: string }): { ok: boolean; error?: string } {
  const custom = loadCustomNews()
  const post: NewsPost = {
    id: `news-${Date.now()}`,
    title: news.title,
    excerpt: news.excerpt,
    content: news.excerpt,
    hotelName: news.hotelName,
    publishedAt: new Date().toISOString(),
  }
  custom.unshift(post)
  saveCustomNews(custom)
  return { ok: true }
}

export function resetHotelUpdates() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(HOTEL_UPDATES_KEY)
    localStorage.removeItem(NEWS_KEY)
  }
}
