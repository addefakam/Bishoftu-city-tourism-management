// Static in-memory data layer — replaces Prisma/SQLite so the app works on
// serverless platforms (Vercel) without a database.
//
// Data is loaded once from src/data/bishoftu.json at module-eval time and
// shared across all API routes. To refresh the data, re-run
// `bun run scripts/export-data.ts` and redeploy.

import data from '@/data/bishoftu.json'

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

export interface Business {
  id: string
  name: string
  type: string
  subCity: string
}

interface DataSet {
  hotels: Hotel[]
  attractions: Attraction[]
  news: NewsPost[]
  businesses: Business[]
}

const ds: DataSet = {
  hotels: data.hotels as Hotel[],
  attractions: data.attractions as Attraction[],
  news: data.news as NewsPost[],
  businesses: data.businesses as Business[],
}

export const store = {
  hotels: {
    findMany: () => [...ds.hotels].sort((a, b) => a.name.localeCompare(b.name)),
    count: () => ds.hotels.length,
  },
  attractions: {
    findMany: () => [...ds.attractions].sort((a, b) => a.name.localeCompare(b.name)),
    count: () => ds.attractions.length,
  },
  news: {
    findMany: ({ take }: { take?: number } = {}) => {
      const sorted = [...ds.news].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      return take ? sorted.slice(0, take) : sorted
    },
    count: () => ds.news.length,
  },
  businesses: {
    findMany: () => [...ds.businesses].sort((a, b) => a.name.localeCompare(b.name)),
    count: () => ds.businesses.length,
  },
}
