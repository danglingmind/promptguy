"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UsernameCheckProps {
  children: React.ReactNode
}

export function UsernameCheck({ children }: UsernameCheckProps) {
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUsername() {
      try {
        const res = await fetch('/api/user/username/check')
        if (res.status === 401) {
          // Not authenticated, let Clerk handle it
          setChecking(false)
          return
        }
        if (res.ok) {
          const data = await res.json()
          if (data.authenticated && !data.hasUsername) {
            // Authenticated user without username, redirect to create
            router.push('/create')
            return
          }
          // Show content for unauthenticated users or authenticated users with usernames
          setChecking(false)
        }
      } catch {
        setChecking(false)
      }
    }

    checkUsername()
  }, [router])

  if (checking) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
