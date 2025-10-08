"use client"

import { useState } from 'react'
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Plus, Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { NotificationCenter } from '@/components/NotificationCenter'
import Link from 'next/link'

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className="shadow sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
          <Logo className="h-8 w-8 text-foreground dark:text-accent" />
          <span className="font-bold text-xl">PromptGuy</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <SignedIn>
            <NotificationCenter />
          </SignedIn>
          <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm hover:bg-muted">
            Dashboard
          </Link>
          <Link href="/create-post" className="mr-4 px-2 py-2 rounded-full text-sm bg-primary text-primary-foreground hover:opacity-90 flex items-center">
            <Plus className="h-4 w-4" />
          </Link>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm">Sign In</Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeMobileMenu}
          />
          
          {/* Mobile Menu */}
          <div className="fixed top-16 left-0 right-0 bg-background border-b shadow-lg z-50">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation Links */}
              <div className="space-y-2">
                <SignedIn>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Notifications</span>
                    <NotificationCenter />
                  </div>
                </SignedIn>
                
                <Link 
                  href="/dashboard" 
                  className="block px-3 py-3 rounded-md text-sm hover:bg-muted transition-colors"
                  onClick={closeMobileMenu}
                >
                  Dashboard
                </Link>
                
                <Link 
                  href="/create-post" 
                  className="block px-3 py-3 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-90 flex items-center"
                  onClick={closeMobileMenu}
                >
                  <Plus className="h-4 w-4 mr-2" /> Create Post
                </Link>
              </div>

              {/* Mobile Auth Section */}
              <div className="pt-4 border-t">
                <SignedIn>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium">Account</span>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="w-full" onClick={closeMobileMenu}>
                      Sign In
                    </Button>
                  </SignInButton>
                </SignedOut>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
