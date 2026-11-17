import { PrismaClient } from '@prisma/client'
import path from 'node:path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// SQLite datasource: the URL must start with `file:`. Environments that
// inject a malformed DATABASE_URL (or none at all) otherwise fail at
// runtime with "Error validating datasource `db`: the URL must start
// with the protocol `file:`". Normalize to the repo's own database file.
if (!process.env.DATABASE_URL?.startsWith('file:')) {
  console.warn(
    `[db] DATABASE_URL is missing or not a file: URL ("${process.env.DATABASE_URL ?? ''}") — defaulting to the repo's db/custom.db`
  )
  process.env.DATABASE_URL = `file:${path.join(process.cwd(), 'db', 'custom.db')}`
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// ── Self-healing: ensure required tables exist at boot ──────────────
// The tracked `db/custom.db` may lag behind the Prisma schema after a
// pull (e.g. SiteSetting added but the local DB predates it). Rather
// than crashing the first read/write with "no such table", create any
// missing tables idempotently. No-op when the table already exists.
const SELF_HEAL_TABLES = `
CREATE TABLE IF NOT EXISTS "SiteImage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "SiteImage_key_key" ON "SiteImage"("key");
CREATE TABLE IF NOT EXISTS "SiteSetting" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key");
`

;(async () => {
  try {
    const statements = SELF_HEAL_TABLES
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
    for (const stmt of statements) {
      await db.$executeRawUnsafe(stmt)
    }
  } catch (err) {
    console.warn('[db] self-heal skipped:', err instanceof Error ? err.message : String(err))
  }
})()
