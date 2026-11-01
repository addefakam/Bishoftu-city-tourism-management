import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const attractions = await db.attraction.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ attractions })
}
