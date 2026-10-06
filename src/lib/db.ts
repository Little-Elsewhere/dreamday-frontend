import 'server-only'

import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

import { serverEnv } from '@/env/server'

const connectionString = ((): string => {
  if (serverEnv.DATABASE_URL) return serverEnv.DATABASE_URL
  const url = new URL(serverEnv.NEXT_PUBLIC_SUPABASE_URL)
  if (!['localhost', '127.0.0.1', 'supabase.local'].includes(url.hostname)) {
    throw new Error('DATABASE_URL is required outside local Supabase')
  }
  const databaseHost = serverEnv.DATABASE_HOST ?? '127.0.0.1'
  return `postgresql://postgres:${encodeURIComponent(serverEnv.DATABASE_PASSWORD)}@${databaseHost}:54322/postgres`
})()

const globalForPrisma = globalThis as unknown as { dreamdayPrisma?: PrismaClient }

export const db =
  globalForPrisma.dreamdayPrisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.dreamdayPrisma = db
