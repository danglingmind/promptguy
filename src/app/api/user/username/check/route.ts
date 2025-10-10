import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ensureUserByClerkId } from '@/lib/auth/ensureUser'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      // Return a more graceful response for unauthenticated users
      return NextResponse.json({ hasUsername: false, authenticated: false })
    }

    // Ensure user exists in our database
    const user = await ensureUserByClerkId(userId)

    // Check if user has a proper username (not the temporary one)
    const isTemporaryUsername = user.username.startsWith('user_') && user.username.endsWith('_temp')
    
    if (isTemporaryUsername || user.username.trim().length < 5) {
      return NextResponse.json({ hasUsername: false, authenticated: true })
    }

    return NextResponse.json({ hasUsername: true, username: user.username, authenticated: true })
  } catch (error) {
    console.error('Error checking username:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json({ 
      error: 'Failed to check username',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
    }, { status: 500 })
  }
}
