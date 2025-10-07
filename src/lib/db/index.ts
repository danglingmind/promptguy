import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

export const prisma: PrismaClient = global.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export const getDatabaseType = (): string => {
  return process.env.DATABASE_TYPE || 'supabase'
}

export { supabase, supabaseAdmin } from './supabaseClient'
export { connectToDatabase, db as mongoDb } from './mongoClient'
