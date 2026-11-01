import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const news = await db.newsPost.findMany({ orderBy: { publishedAt: 'desc' }, take: 6 })
  return NextResponse.json({ news })
}
