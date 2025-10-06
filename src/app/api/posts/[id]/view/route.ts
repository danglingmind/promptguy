import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import type { ViewPostResponse } from '@/types/interactions'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // optional user context for future personalization
    await auth()

    const { id: postId } = await params

    const post = await prisma.post.update({
      where: { id: postId },
      data: { viewsCount: { increment: 1 } },
      select: { viewsCount: true }
    })

    const res: ViewPostResponse = { viewsCount: post.viewsCount }
    return NextResponse.json(res)
  } catch (error) {
    console.error('Error incrementing view:', error)
    return NextResponse.json({ error: 'Failed to increment view' }, { status: 500 })
  }
}

