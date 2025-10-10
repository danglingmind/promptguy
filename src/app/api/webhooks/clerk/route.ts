import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { prisma } from '@/lib/db'

// Clerk webhook handler to upsert users
export async function POST(request: NextRequest) {
  const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!CLERK_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const payload = await request.text()
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)

  try {
    const evt = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    }) as {
      type: string
      data: Record<string, unknown>
    }

    if (evt.type === 'user.created' || evt.type === 'user.updated') {
      const data = evt.data as {
        id: string
        username: string | null
        first_name: string | null
        last_name: string | null
        image_url: string | null
        email_addresses: Array<{ email_address: string }>
      }

      const email = data.email_addresses?.[0]?.email_address || ''

      await prisma.user.upsert({
        where: { clerkId: data.id },
        create: {
          clerkId: data.id,
          email,
          username: `user_${data.id.slice(0, 8)}_temp`, // Use temporary username for new users
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url
        },
        update: {
          email,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url
          // Don't update username in webhook - let user set it manually
        }
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook verification failed', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
}

