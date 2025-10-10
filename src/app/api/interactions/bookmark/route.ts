import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import type { ToggleBookmarkRequestBody, ToggleBookmarkResponse } from '@/types/interactions'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Please sign in to bookmark posts' }, { status: 401 })
    }

    const { postId } = (await request.json()) as ToggleBookmarkRequestBody

    const user = await ensureUserByClerkId(userId)

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

      const res: ToggleBookmarkResponse = { bookmarked: false }
      return NextResponse.json(res)
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

      const res: ToggleBookmarkResponse = { bookmarked: true }
      return NextResponse.json(res)
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 })
  }
}
