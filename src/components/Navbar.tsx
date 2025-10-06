"use client"

import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { NotificationCenter } from '@/components/NotificationCenter'
import Link from 'next/link'
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu'

export function Navbar() {
  return (
    <nav className="shadow sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Logo className="h-8 w-8 text-foreground dark:text-accent" />
          <span className="font-bold text-xl">PromptGuy</span>
        </Link>

        {/* Spacer to balance layout */}
        <div className="flex-1 mx-8" />

        {/* Right Side Actions - shadcn NavigationMenu */}
        <NavigationMenu>
          <NavigationMenuList className="items-center gap-2">
            <NavigationMenuItem>
              <SignedIn>
                <NotificationCenter />
              </SignedIn>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm hover:bg-muted">
                  Dashboard
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink asChild>
                <Link href="/create" className="px-3 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-90 flex items-center">
                  <Plus className="h-4 w-4 mr-2" /> Create
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="sm">Sign In</Button>
                </SignInButton>
              </SignedOut>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  )
}
