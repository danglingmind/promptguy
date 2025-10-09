import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { ensureUserByClerkId, isReservedUsername, isValidUsernameFormat, normalizeUsername } from '@/lib/auth/ensureUser'

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return bad('Unauthorized', 401)

    const body = (await request.json()) as { username: string }
    const username = body?.username || ''

    if (!isValidUsernameFormat(username)) return bad('Invalid username')
    if (isReservedUsername(username)) return bad('Reserved username')

    const user = await ensureUserByClerkId(userId)

    // Check if user has a proper username (not the temporary one)
    const isTemporaryUsername = user.username.startsWith('user_') && user.username.endsWith('_temp')
    
    if (!isTemporaryUsername && user.username && user.username.trim().length >= 5) {
      return bad('Username already set', 409)
    }

    const normalized = normalizeUsername(username)

    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: normalized },
          { username },
        ],
      },
      select: { id: true },
    })
    if (existing) return bad('Username taken', 409)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { username: normalized },
      select: {
        id: true, username: true, firstName: true, lastName: true, imageUrl: true
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error setting username:', error)
    return bad('Failed to set username', 500)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return bad('Unauthorized', 401)

    const body = (await request.json()) as { username: string }
    const username = body?.username || ''

    if (!isValidUsernameFormat(username)) return bad('Invalid username')
    if (isReservedUsername(username)) return bad('Reserved username')

    const user = await ensureUserByClerkId(userId)

    const normalized = normalizeUsername(username)

    // Optional: rate limit could be added here

    const existing = await prisma.user.findFirst({
      where: {
        AND: [
          {
            OR: [
              { username: normalized },
              { username },
            ],
          },
          { id: { not: user.id } },
        ],
      },
      select: { id: true },
    })
    if (existing) return bad('Username taken', 409)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { username: normalized },
      select: {
        id: true, username: true, firstName: true, lastName: true, imageUrl: true
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating username:', error)
    return bad('Failed to update username', 500)
  }
}
