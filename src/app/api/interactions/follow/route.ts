import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import type { ToggleFollowRequestBody, ToggleFollowResponse } from '@/types/interactions'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUserId } = (await request.json()) as ToggleFollowRequestBody

    const user = await ensureUserByClerkId(userId)

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId: targetUserId
        }
      }
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: targetUserId
          }
        }
      })

      const res: ToggleFollowResponse = { following: false }
      return NextResponse.json(res)
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: targetUserId
        }
      })

      // Create notification for target user
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: 'follow',
          title: 'New Follower',
          message: `${user.firstName || user.username} started following you`,
          relatedUserId: user.id
        }
      })

      const res: ToggleFollowResponse = { following: true }
      return NextResponse.json(res)
    }
  } catch (error) {
    console.error('Error toggling follow:', error)
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 })
  }
}
