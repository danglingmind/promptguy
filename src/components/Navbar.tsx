"use client"

import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { NotificationCenter } from '@/components/NotificationCenter'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-8 w-8 text-foreground dark:text-accent" />
          <span className="font-bold text-xl">PromptGuy</span>
        </Link>

        {/* Spacer to balance layout */}
        <div className="flex-1 mx-8" />

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <SignedIn>
            <NotificationCenter />
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/create">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Link>
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button>Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  )
}
