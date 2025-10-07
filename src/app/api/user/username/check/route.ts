import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ 
      where: { clerkId: userId }, 
      select: { username: true } 
    })

    if (!user || !user.username || user.username.trim().length < 5) {
      return NextResponse.json({ error: 'No username set' }, { status: 404 })
    }

    return NextResponse.json({ username: user.username })
  } catch (error) {
    console.error('Error checking username:', error)
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 })
  }
}
