import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') || 'desc'
    const model = searchParams.get('model')
    const purpose = searchParams.get('purpose')
    const search = searchParams.get('search')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isPublic: true
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

    const posts = await prisma.post.findMany({
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
        _count: {
          select: {
            likes: true,
            bookmarks: true,
            shares: true
          }
        }
      },
      orderBy: { [sortBy]: order },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({ posts })
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

    const body = await request.json()
    const { title, content, model, purpose, tags, isPublic } = body

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // Create user from Clerk data
      const clerkUser = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`
        }
      }).then(res => res.json())

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.email_addresses[0]?.email_address || '',
          username: clerkUser.username || `user_${userId.slice(-8)}`,
          firstName: clerkUser.first_name,
          lastName: clerkUser.last_name,
          imageUrl: clerkUser.image_url
        }
      })
    }

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

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}
