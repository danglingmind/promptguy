import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { isReservedUsername, isValidUsernameFormat, normalizeUsername } from '@/lib/auth/ensureUser'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const u = searchParams.get('u') || ''

    if (!isValidUsernameFormat(u)) {
      return NextResponse.json({ available: false, reason: 'invalid_format' })
    }

    if (isReservedUsername(u)) {
      return NextResponse.json({ available: false, reason: 'reserved' })
    }

    const normalized = normalizeUsername(u)

    // Assuming normalizedUsername column exists; fallback to case-insensitive find if not
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { username: normalized },
          { username: u },
        ],
      },
      select: { id: true },
    })

    return NextResponse.json({ available: !existing })
  } catch (error) {
    console.error('Error checking username availability:', error)
    return NextResponse.json({ available: false, reason: 'error' }, { status: 500 })
  }
}
