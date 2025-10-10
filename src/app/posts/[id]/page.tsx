"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

interface PostPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PostPage({ params }: PostPageProps) {
  const router = useRouter()
  const { id } = use(params)

  useEffect(() => {
    // Redirect to homepage with post ID as query parameter
    router.replace(`/?post=${id}`)
  }, [router, id])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Opening post...</p>
      </div>
    </div>
  )
}
