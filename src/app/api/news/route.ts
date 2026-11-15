import { NextResponse } from 'next/server'
import { store } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const news = store.news.findMany({ take: 6 })
  return NextResponse.json({ news })
}
