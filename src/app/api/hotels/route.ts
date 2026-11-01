import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const hotels = await db.hotel.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ hotels })
}
