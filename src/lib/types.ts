// Shared client-side types matching the API responses.

export interface Hotel {
  id: string
  name: string
  description: string
  starRating: number
  type: string
  subCity: string
  address: string
  pricePerNight: number | null
  totalRooms: number
  occupiedRooms: number
  imageUrl: string | null
  phone: string | null
  email: string | null
  featured: boolean
}

export interface Attraction {
  id: string
  name: string
  description: string
  category: string
  subCity: string | null
  imageUrl: string | null
  featured: boolean
}

export interface NewsPost {
  id: string
  title: string
  excerpt: string
  content: string | null
  hotelName: string | null
  publishedAt: string
}

export interface TopHotel extends Hotel {
  occupancy: number
  availableRooms: number
}

export interface CityStats {
  registeredHotels: number
  totalRooms: number
  availableRooms: number
  currentGuests: number
  cityOccupancy: number
  attractions: number
  businesses: number
  topHotels: TopHotel[]
  byType: { type: string; count: number }[]
  bySubCity: { subCity: string; count: number }[]
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}
