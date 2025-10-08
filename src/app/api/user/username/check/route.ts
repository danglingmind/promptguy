import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in our database
    const user = await ensureUserByClerkId(userId)

    // Check if user has a proper username (not the temporary one)
    const isTemporaryUsername = user.username.startsWith('user_') && user.username.endsWith('_temp')
    
    if (isTemporaryUsername || user.username.trim().length < 5) {
      return NextResponse.json({ hasUsername: false })
    }

    return NextResponse.json({ hasUsername: true, username: user.username })
  } catch (error) {
    console.error('Error checking username:', error)
    return NextResponse.json({ error: 'Failed to check username' }, { status: 500 })
  }
}
