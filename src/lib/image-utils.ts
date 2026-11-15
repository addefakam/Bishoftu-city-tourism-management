// Shared client-side image compression for hotel card photo uploads —
// used by tourists on the /hotels page and by the tourism admin dashboard.

export const MAX_FILE_BYTES = 15 * 1024 * 1024

// Compress the chosen image in the browser (max 1280px, JPEG) so the
// upload stays small enough to store as a base64 data URL in SQLite.
export async function compressToDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file')
  if (file.size > MAX_FILE_BYTES) throw new Error('That image is too large — please choose one under 15 MB')
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height))
  const w = Math.max(1, Math.round(bitmap.width * scale))
  const h = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Your browser could not process the image')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', 0.82)
}
