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

    // Check if already bookmarked
    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId: user.id,
          postId
        }
      }
    })

    if (existingBookmark) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: {
          userId_postId: {
            userId: user.id,
            postId
          }
        }
      })

      // Update post bookmarks count
      await prisma.post.update({
        where: { id: postId },
        data: {
          bookmarksCount: {
            decrement: 1
          }
        }
      })

      return NextResponse.json({ bookmarked: false })
    } else {
      // Add bookmark
      await prisma.bookmark.create({
        data: {
          userId: user.id,
          postId
        }
      })

      // Update post bookmarks count
      await prisma.post.update({
        where: { id: postId },
        data: {
          bookmarksCount: {
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
            type: 'bookmark',
            title: 'New Bookmark',
            message: `${user.firstName || user.username} bookmarked your prompt "${post.title}"`,
            relatedUserId: user.id,
            relatedPostId: postId
          }
        })
      }

      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 })
  }
}
