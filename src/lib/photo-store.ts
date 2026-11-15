import { put, list } from '@vercel/blob'
import { db } from '@/lib/db'

// Hotel photos (uploaded by tourists on /hotels and by the tourism admin
// from the dashboard). Two storage backends:
//
// - Vercel Blob, when BLOB_READ_WRITE_TOKEN is set: the only way to
//   persist on serverless hosts, where the deployment filesystem is
//   read-only. Each photo is one blob object (photos/<hotelId>.jpg);
//   list() doubles as the metadata index, so no separate mapping store.
// - SQLite TouristPhoto table (default, local use): the compressed
//   data URL is stored in the repo's own db/custom.db.

const BLOB_PREFIX = 'photos/'

export const hasBlobStorage = () => !!process.env.BLOB_READ_WRITE_TOKEN

/**
 * Persists one photo and returns the URL to render on the cards:
 * a public blob URL in Blob mode, or the data URL in SQLite mode.
 */
export async function savePhoto(hotelId: string, dataUrl: string): Promise<string> {
  if (hasBlobStorage()) {
    const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
    const bytes = Buffer.from(base64, 'base64')
    const blob = await put(`photos/${hotelId}.jpg`, bytes, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'image/jpeg',
    })
    return blob.url
  }

  // The Prisma client is generated from schema.prisma at install/build
  // time. If the running server predates the TouristPhoto model, the
  // delegate is undefined — tell the operator exactly how to fix it.
  if (!db.touristPhoto) {
    throw new Error(
      'the server\'s Prisma client is out of date (TouristPhoto model missing) — run "npx prisma generate" and restart the server, or redeploy after a fresh install'
    )
  }
  const saved = await db.touristPhoto.upsert({
    where: { hotelId },
    update: { dataUrl },
    create: { hotelId, dataUrl },
  })
  return saved.dataUrl
}

/** hotelId -> photo URL (blob URL or data URL) for all saved photos. */
export async function listPhotos(): Promise<Map<string, string>> {
  const photos = new Map<string, string>()
  if (hasBlobStorage()) {
    const res = await list({ prefix: BLOB_PREFIX })
    for (const b of res.blobs) {
      const hotelId = b.pathname.slice(BLOB_PREFIX.length).replace(/\.jpg$/, '')
      if (hotelId) photos.set(hotelId, b.url)
    }
    return photos
  }
  if (!db.touristPhoto) return photos
  const rows = await db.touristPhoto.findMany({ select: { hotelId: true, dataUrl: true } })
  for (const r of rows) photos.set(r.hotelId, r.dataUrl)
  return photos
}
