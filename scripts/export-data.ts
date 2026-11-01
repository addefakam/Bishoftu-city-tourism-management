// Export the current SQLite database to a static JSON file.
// Run with: bun run scripts/export-data.ts
import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'

const db = new PrismaClient()

async function main() {
  const [hotels, attractions, news, businesses] = await Promise.all([
    db.hotel.findMany({ orderBy: { name: 'asc' } }),
    db.attraction.findMany({ orderBy: { name: 'asc' } }),
    db.newsPost.findMany({ orderBy: { publishedAt: 'desc' } }),
    db.business.findMany({ orderBy: { name: 'asc' } }),
  ])

  const data = {
    exportedAt: new Date().toISOString(),
    hotels: hotels.map((h) => ({ ...h, createdAt: h.createdAt.toISOString() })),
    attractions: attractions.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    news: news.map((n) => ({ ...n, publishedAt: n.publishedAt.toISOString() })),
    businesses: businesses.map((b) => ({ ...b, createdAt: b.createdAt.toISOString() })),
  }

  const outPath = '/home/z/my-project/src/data/bishoftu.json'
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, JSON.stringify(data, null, 2))
  console.log(`Exported ${hotels.length} hotels, ${attractions.length} attractions, ${news.length} news, ${businesses.length} businesses → ${outPath}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
