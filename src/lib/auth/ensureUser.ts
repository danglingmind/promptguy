import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import type { ProvisionedUser } from '@/types/auth'

export async function ensureUserByClerkId(clerkUserId: string): Promise<ProvisionedUser> {
  const existing = await prisma.user.findUnique({ where: { clerkId: clerkUserId } })
  if (existing) {
    return {
      id: existing.id,
      clerkId: existing.clerkId,
      email: existing.email,
      username: existing.username,
      firstName: existing.firstName,
      lastName: existing.lastName,
      imageUrl: existing.imageUrl
    }
  }

  const client = await clerkClient()
  const clerkUser = await client.users.getUser(clerkUserId)

  const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress || ''
  const username = clerkUser.username || `user_${clerkUserId.slice(-8)}`
  const created = await prisma.user.create({
    data: {
      clerkId: clerkUserId,
      email: primaryEmail,
      username,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl
    }
  })

  return {
    id: created.id,
    clerkId: created.clerkId,
    email: created.email,
    username: created.username,
    firstName: created.firstName,
    lastName: created.lastName,
    imageUrl: created.imageUrl
  }
}

