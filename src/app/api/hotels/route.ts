import { NextResponse } from 'next/server'
import { store } from '@/lib/data'

export async function GET() {
  const hotels = store.hotels.findMany()
  return NextResponse.json({ hotels })
}
