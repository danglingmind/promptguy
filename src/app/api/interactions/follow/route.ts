import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUserId } = await request.json()

    // Get current user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

      return NextResponse.json({ following: false })
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

      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('Error toggling follow:', error)
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 })
  }
}
