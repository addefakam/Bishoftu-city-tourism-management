import { NextResponse } from 'next/server'
import { store } from '@/lib/data'

export async function GET() {
  const attractions = store.attractions.findMany()
  return NextResponse.json({ attractions })
}
