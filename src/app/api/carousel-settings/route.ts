import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GMS_API_URL = process.env.GMS_API_URL || ''
const GMS_API_KEY = process.env.GMS_API_KEY || ''

const DEFAULTS = {
  images: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80',
  ],
  interval: 5,
}

export async function GET() {
  if (!GMS_API_URL || !GMS_API_KEY) return NextResponse.json({ data: DEFAULTS })
  try {
    const res = await fetch(`${GMS_API_URL}/api/v1/carousel-settings`, {
      headers: { 'x-api-key': GMS_API_KEY }, cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json({ data: data.data || DEFAULTS })
  } catch { return NextResponse.json({ data: DEFAULTS }) }
}

export async function PUT(req: Request) {
  if (!GMS_API_URL || !GMS_API_KEY) return NextResponse.json({ error: 'GMS not configured' }, { status: 500 })
  try {
    const body = await req.json()
    const res = await fetch(`${GMS_API_URL}/api/v1/carousel-settings`, {
      method: 'PUT', headers: { 'x-api-key': GMS_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(body), cache: 'no-store',
    })
    const data = await res.json()
    return NextResponse.json({ success: true, data: data.data || body })
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}
