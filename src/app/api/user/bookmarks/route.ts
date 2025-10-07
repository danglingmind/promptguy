import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await ensureUserByClerkId(userId)

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                imageUrl: true
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    })

    const formattedBookmarks = bookmarks.map(bookmark => ({
      id: bookmark.id,
      post: {
        id: bookmark.post.id,
        title: bookmark.post.title,
        content: bookmark.post.content,
        model: bookmark.post.model,
        purpose: bookmark.post.purpose,
        tags: bookmark.post.tags,
        isPublic: bookmark.post.isPublic,
        likesCount: bookmark.post.likesCount,
        bookmarksCount: bookmark.post.bookmarksCount,
        sharesCount: bookmark.post.sharesCount,
        viewsCount: bookmark.post.viewsCount,
        author: {
          id: bookmark.post.author.id,
          username: bookmark.post.author.username,
          firstName: bookmark.post.author.firstName,
          lastName: bookmark.post.author.lastName,
          imageUrl: bookmark.post.author.imageUrl
        },
        createdAt: bookmark.post.createdAt.toISOString()
      }
    }))

    return NextResponse.json({ bookmarks: formattedBookmarks })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
  }
}