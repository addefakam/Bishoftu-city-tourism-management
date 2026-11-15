import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/gms-status
 * 
 * Server-side endpoint that checks if the GMS integration is configured
 * and tests the connection. The client-side GmsConnectionSettings
 * component fetches from this endpoint because process.env is not
 * available in the browser.
 * 
 * Returns: { configured, apiUrl, apiKeyPrefix, connected, integrationName, scopes, error }
 */
export async function GET() {
  const apiUrl = process.env.GMS_API_URL || ''
  const apiKey = process.env.GMS_API_KEY || ''
  
  if (!apiUrl || !apiKey) {
    return NextResponse.json({
      configured: false,
      apiUrl: '',
      apiKeyPrefix: '',
      connected: false,
      error: 'GMS_API_URL and GMS_API_KEY environment variables are not set.',
    })
  }

  // Test the connection to the GMS
  try {
    const res = await fetch(`${apiUrl}/api/v1/health`, {
      headers: { 'x-api-key': apiKey },
      cache: 'no-store',
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return NextResponse.json({
        configured: true,
        apiUrl,
        apiKeyPrefix: apiKey.slice(0, 12) + '••••••••',
        connected: false,
        error: `GMS returned ${res.status}: ${text || res.statusText}`,
      })
    }

    const data = await res.json()
    return NextResponse.json({
      configured: true,
      apiUrl,
      apiKeyPrefix: apiKey.slice(0, 12) + '••••••••',
      connected: true,
      integrationName: data.data?.integration?.name || 'Unknown',
      scopes: data.data?.integration?.scopes || [],
    })
  } catch (err) {
    return NextResponse.json({
      configured: true,
      apiUrl,
      apiKeyPrefix: apiKey.slice(0, 12) + '••••••••',
      connected: false,
      error: err instanceof Error ? err.message : 'Connection failed',
    })
  }
}
