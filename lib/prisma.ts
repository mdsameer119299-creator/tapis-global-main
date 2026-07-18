import { PrismaClient } from '@prisma/client'

// Standard Next.js dev-mode singleton pattern — without this, hot reload
// creates a new PrismaClient (and a new DB connection pool) on every file
// change, quickly exhausting Postgres connection limits.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
