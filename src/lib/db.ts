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