import { NextResponse } from 'next/server'
import { hasBlobStorage } from '@/lib/photo-store'

export const dynamic = 'force-dynamic'

/**
 * GET /api/photo-storage-status
 *
 * Deployment self-diagnosis for hotel photo storage. Photos persist in
 * Vercel Blob when this runtime can authenticate: the classic
 * BLOB_READ_WRITE_TOKEN, or a connected store (BLOB_STORE_ID) with
 * Vercel OIDC enabled. Returns no secret values — just the active mode
 * and the NAMES of related environment variables, so a misconnected
 * store (or a missing redeploy) is immediately visible.
 */
export function GET() {
  const envVarNames = Object.keys(process.env).filter((k) =>
    /BLOB|POSTGRES|TURSO|DATABASE_URL|SUPABASE|NEON/i.test(k)
  )
  const blobConfigured = hasBlobStorage()
  return NextResponse.json({
    blobConfigured,
    storageMode: blobConfigured ? 'vercel-blob' : 'sqlite',
    envVarNames,
    hint: blobConfigured
      ? 'Blob credentials visible — uploads should go to Vercel Blob'
      : 'No Blob credentials visible to this deployment: connect the store to THIS project and redeploy (injects BLOB_STORE_ID), or add BLOB_READ_WRITE_TOKEN manually in Settings → Environment Variables',
  })
}
