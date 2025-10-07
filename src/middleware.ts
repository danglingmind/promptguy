import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: ['/((?!.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
