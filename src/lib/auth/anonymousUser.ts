import { prisma } from '@/lib/db'

/**
 * Anonymous user system for tracking non-authenticated users
 * Creates a special anonymous user that represents all non-logged-in visitors
 */

const ANONYMOUS_USER_CLERK_ID = 'anonymous_visitor'
const ANONYMOUS_USER_EMAIL = 'anonymous@promptguy.com'
const ANONYMOUS_USER_USERNAME = 'anonymous_visitor'

/**
 * Ensures an anonymous user exists in the database
 * This user represents all non-authenticated visitors
 */
export async function ensureAnonymousUser() {
  try {
    // Try to find existing anonymous user
    let anonymousUser = await prisma.user.findUnique({
      where: { clerkId: ANONYMOUS_USER_CLERK_ID }
    })

    // Create anonymous user if it doesn't exist
    if (!anonymousUser) {
      anonymousUser = await prisma.user.create({
        data: {
          clerkId: ANONYMOUS_USER_CLERK_ID,
          email: ANONYMOUS_USER_EMAIL,
          username: ANONYMOUS_USER_USERNAME,
          firstName: 'Anonymous',
          lastName: 'Visitor',
          bio: 'Represents all non-authenticated visitors to the platform'
        }
      })
      console.log('Created anonymous user for tracking non-authenticated views')
    }

    return anonymousUser
  } catch (error) {
    console.error('Error ensuring anonymous user:', error)
    throw error
  }
}

/**
 * Gets the anonymous user ID for tracking non-authenticated views
 */
export async function getAnonymousUserId(): Promise<string> {
  const anonymousUser = await ensureAnonymousUser()
  return anonymousUser.id
}

/**
 * Checks if a user ID represents an anonymous user
 */
export function isAnonymousUser(userId: string): boolean {
  return userId === ANONYMOUS_USER_CLERK_ID
}
