"use client"

import { useEffect } from 'react'

export function BrandThemeLoader(): null {
  useEffect(() => {
    const root = document.documentElement
    const brandPrimary = process.env.NEXT_PUBLIC_BRAND_PRIMARY
    const brandSecondary = process.env.NEXT_PUBLIC_BRAND_SECONDARY
    const brandAccent = process.env.NEXT_PUBLIC_BRAND_ACCENT

    // Set brand variables for compatibility
    if (brandPrimary) {
      root.style.setProperty('--brand-500', brandPrimary)
      // Map to shadcn/ui primary color
      root.style.setProperty('--primary', brandPrimary)
    }
    if (brandSecondary) {
      root.style.setProperty('--brand-300', brandSecondary)
      // Map to shadcn/ui secondary color
      root.style.setProperty('--secondary', brandSecondary)
    }
    if (brandAccent) {
      root.style.setProperty('--brand-accent', brandAccent)
      // Map to shadcn/ui accent color
      root.style.setProperty('--accent', brandAccent)
    }
  }, [])

  return null
}


