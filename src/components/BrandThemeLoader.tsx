"use client"

import { useEffect } from 'react'

export function BrandThemeLoader(): null {
  useEffect(() => {
    const root = document.documentElement
    const brandPrimary = process.env.NEXT_PUBLIC_BRAND_PRIMARY
    const brandSecondary = process.env.NEXT_PUBLIC_BRAND_SECONDARY
    const brandAccent = process.env.NEXT_PUBLIC_BRAND_ACCENT

    if (brandPrimary) root.style.setProperty('--brand-500', brandPrimary)
    if (brandSecondary) root.style.setProperty('--brand-300', brandSecondary)
    if (brandAccent) root.style.setProperty('--brand-accent', brandAccent)
  }, [])

  return null
}


