import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/create(.*)',
  '/api/posts(.*)',
  '/api/interactions(.*)',
  '/api/notifications(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const { userId } = await auth()
    if (!userId) {
      const isApi = req.nextUrl.pathname.startsWith('/api') || req.nextUrl.pathname.startsWith('/trpc')
      if (isApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const redirectUrl = new URL('/', req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)'
  ],
}
