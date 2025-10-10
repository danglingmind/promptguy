import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import type { ViewPostResponse } from '@/types/interactions'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'
import { getAnonymousUserId } from '@/lib/auth/anonymousUser'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    const { id: postId } = await params

    let viewerId: string
    if (userId) {
      // Authenticated user - use their actual user ID
      const user = await ensureUserByClerkId(userId)
      viewerId = user.id
    } else {
      // Non-authenticated user - use anonymous user ID for tracking
      viewerId = await getAnonymousUserId()
    }

    await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: { viewsCount: { increment: 1 } },
      }),
      prisma.view.create({
        data: {
          postId,
          userId: viewerId,
        }
      })
    ])

    const updated = await prisma.post.findUnique({ where: { id: postId }, select: { viewsCount: true } })
    const res: ViewPostResponse = { viewsCount: updated?.viewsCount ?? 0 }
    return NextResponse.json(res)
  } catch (error) {
    console.error('Error incrementing view:', error)
    return NextResponse.json({ error: 'Failed to increment view' }, { status: 500 })
  }
}

