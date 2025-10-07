import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'
import type { CreatePostRequestBody, PostResponse } from '@/types/post'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params
    const body = (await request.json()) as CreatePostRequestBody
    const { title, content, model, purpose, tags, isPublic } = body

    const user = await ensureUserByClerkId(userId)

    // Verify post ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existingPost.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        model,
        purpose,
        tags,
        isPublic
      },
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
    })

    const response: PostResponse = {
      id: post.id,
      title: post.title,
      content: post.content,
      model: post.model,
      purpose: post.purpose,
      tags: post.tags,
      isPublic: post.isPublic,
      likesCount: post.likesCount,
      bookmarksCount: post.bookmarksCount,
      sharesCount: post.sharesCount,
      viewsCount: post.viewsCount,
      author: {
        id: post.author.id,
        username: post.author.username,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        imageUrl: post.author.imageUrl
      },
      createdAt: post.createdAt.toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params
    const user = await ensureUserByClerkId(userId)

    // Verify post ownership
    const existingPost = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (existingPost.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete post (cascade will handle related records)
    await prisma.post.delete({
      where: { id: postId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting post:', error)
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: postId } = await params
    const user = await ensureUserByClerkId(userId)

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            imageUrl: true
          }
        },
        likes: { select: { userId: true } },
        bookmarks: { select: { userId: true } }
      }
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (!post.isPublic && post.authorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const response: PostResponse = {
      id: post.id,
      title: post.title,
      content: post.content,
      model: post.model,
      purpose: post.purpose,
      tags: post.tags,
      isPublic: post.isPublic,
      likesCount: post.likesCount,
      bookmarksCount: post.bookmarksCount,
      sharesCount: post.sharesCount,
      viewsCount: post.viewsCount,
      author: {
        id: post.author.id,
        username: post.author.username,
        firstName: post.author.firstName,
        lastName: post.author.lastName,
        imageUrl: post.author.imageUrl
      },
      createdAt: post.createdAt.toISOString(),
      isLikedByCurrentUser: post.likes.some(l => l.userId === user.id),
      isBookmarkedByCurrentUser: post.bookmarks.some(b => b.userId === user.id)
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
  }
}
