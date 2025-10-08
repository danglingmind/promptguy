import { prisma } from '@/lib/db'

/**
 * Ensure the application-level user exists for a given Clerk user id.
 */
export async function ensureUserByClerkId(clerkId: string) {
  const existing = await prisma.user.findUnique({ where: { clerkId } })
  if (existing) return existing
  // If not found, create a minimal record. Other fields can be filled later.
  return prisma.user.create({
    data: {
      clerkId,
      email: `${clerkId}@placeholder.local`,
      username: `user_${clerkId.slice(0, 8)}_temp`,
    }
  })
}

export const RESERVED_USERNAMES = new Set([
  'admin','root','support','system','api','settings','dashboard','me','auth','login','logout','signup','register','help','about','contact'
])

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase()
}

export function isValidUsernameFormat(username: string): boolean {
  if (!username) return false
  const trimmed = username.trim()
  if (trimmed.length < 5 || trimmed.length > 30) return false
  return /^[a-zA-Z0-9]+$/.test(trimmed)
}

export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.has(normalizeUsername(username))
}

