import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import type { CreatePostRequestBody, ListPostsQuery, ListPostsResponse, PostResponse } from '@/types/post'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortByParam = (searchParams.get('sortBy') || 'createdAt') as ListPostsQuery['sortBy']
    const orderParam = (searchParams.get('order') || 'desc') as ListPostsQuery['order']
    const model = searchParams.get('model') || undefined
    const purpose = searchParams.get('purpose') || undefined
    const search = searchParams.get('search') || undefined
    const userOnly = searchParams.get('userOnly') === 'true'

    // If userOnly is true, get the current user and filter by their posts
    let authorId: string | undefined
    if (userOnly) {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const user = await ensureUserByClerkId(userId)
      authorId = user.id
    }

    const where: {
      isPublic?: boolean
      authorId?: string
      model?: string
      purpose?: string
      OR?: Array<{ title: { contains: string; mode: 'insensitive' } } | { content: { contains: string; mode: 'insensitive' } } | { tags: { has: string } }>
    } = {}

    if (userOnly) {
      where.authorId = authorId
    } else {
      where.isPublic = true
    }

    if (model) where.model = model
    if (purpose) where.purpose = purpose
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ]
    }

    // Compute ETag from latest update timestamp and total count for cheap change detection
    const [{ userId: clerkUserId }, meta, posts] = await Promise.all([
      auth(),
      prisma.post.aggregate({
        where,
        _max: { updatedAt: true },
        _count: { _all: true }
      }),
      prisma.post.findMany({
      where,
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
      },
      orderBy: { [sortByParam || 'createdAt']: orderParam || 'desc' },
      skip: (page - 1) * limit,
      take: limit
      })
    ])

    // If authenticated, resolve local user id for per-user flags
    let currentUserLocalId: string | undefined
    if (clerkUserId) {
      const user = await ensureUserByClerkId(clerkUserId)
      currentUserLocalId = user.id
    }

    const latest = meta._max.updatedAt?.toISOString() || '0'
    const total = String(meta._count._all || 0)
    const etag = `W/"${latest}:${total}:${page}:${limit}:${sortByParam}:${orderParam}:${model ?? ''}:${purpose ?? ''}:${search ?? ''}"`

    const ifNoneMatch = request.headers.get('if-none-match')
    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } })
    }

    const response: ListPostsResponse = {
      posts: posts.map((p: any): PostResponse => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: p.id,
        title: p.title,
        content: p.content,
        model: p.model,
        purpose: p.purpose,
        tags: p.tags,
        isPublic: p.isPublic,
        likesCount: p.likesCount,
        bookmarksCount: p.bookmarksCount,
        sharesCount: p.sharesCount,
        viewsCount: p.viewsCount,
        author: {
          id: p.author.id,
          username: p.author.username,
          firstName: p.author.firstName,
          lastName: p.author.lastName,
          imageUrl: p.author.imageUrl
        },
        createdAt: p.createdAt.toISOString(),
        isLikedByCurrentUser: Boolean(
          currentUserLocalId && p.likes.some((l: { userId: string }) => l.userId === currentUserLocalId)
        ),
        isBookmarkedByCurrentUser: Boolean(
          currentUserLocalId && p.bookmarks.some((b: { userId: string }) => b.userId === currentUserLocalId)
        )
      })),
      hasMore: posts.length === limit
    }

    return NextResponse.json(response, {
      headers: {
        ETag: etag,
        'Cache-Control': 'no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as CreatePostRequestBody
    const { title, content, model, purpose, tags, isPublic } = body

    // Get or create user
    const user = await ensureUserByClerkId(userId)

    const post = await prisma.post.create({
      data: {
        title,
        content,
        model,
        purpose,
        tags,
        isPublic,
        authorId: user.id
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
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
