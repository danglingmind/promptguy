import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await request.json()

    // Get user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId
          }
        }
      })

      // Update post likes count
      await prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ liked: false })
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: user.id,
          postId
        }
      })

      // Update post likes count
      await prisma.post.update({
        where: { id: postId },
        data: {
          likesCount: {
            increment: 1
          }
        }
      })

      // Create notification for post author
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: { authorId: true, title: true }
      })

      if (post && post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: 'like',
            title: 'New Like',
            message: `${user.firstName || user.username} liked your prompt "${post.title}"`,
            relatedUserId: user.id,
            relatedPostId: postId
          }
        })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
