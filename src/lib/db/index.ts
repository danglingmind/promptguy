import { PrismaClient } from '@prisma/client'
import { mockPrisma } from './mockClient'

// Global variable to store the Prisma client instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if we should use mock database (when DATABASE_URL is not set or invalid)
const useMockDatabase = !process.env.DATABASE_URL || process.env.DATABASE_URL === '' || process.env.DATABASE_URL.includes('yxivrwwtecancadpfxnh')

console.log('Database URL:', process.env.DATABASE_URL)
console.log('Using mock database:', useMockDatabase)

// Create Prisma client instance or use mock
let prisma: any

if (useMockDatabase) {
  console.log('Using mock database for development')
  prisma = mockPrisma
} else {
  console.log('Using real database')
  prisma = globalForPrisma.prisma ?? new PrismaClient()
}

export { prisma }

// In development, store the client on globalThis to prevent multiple instances
if (process.env.NODE_ENV !== 'production' && !useMockDatabase) {
  globalForPrisma.prisma = prisma
}

// Database type selection
export const getDatabaseType = () => {
  return process.env.DATABASE_TYPE || 'supabase'
}

// Export database clients based on configuration
export { supabase, supabaseAdmin } from './supabaseClient'
export { connectToDatabase, db as mongoDb } from './mongoClient'
