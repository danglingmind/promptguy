"use client"

import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Search, Plus } from 'lucide-react'
import { NotificationCenter } from '@/components/NotificationCenter'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-bold text-xl">PromptGuy</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search prompts..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

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
