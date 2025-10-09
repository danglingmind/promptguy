import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from our database
    const user = await ensureUserByClerkId(userId)

    return NextResponse.json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      email: user.email
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 })
  }
}
