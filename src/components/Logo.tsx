import React from 'react'

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="PromptGuy logo"
    >
      <path d="M16 28c0-8.837 7.163-16 16-16h64c8.837 0 16 7.163 16 16v44c0 8.837-7.163 16-16 16H60l-18 18v-18H32c-8.837 0-16-7.163-16-16V28z" fill="currentColor" fillOpacity="0.08"/>
      <path d="M44 28l18-12-8 16 14-6-10 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="48" cy="62" r="14" stroke="currentColor" strokeWidth="4"/>
      <circle cx="80" cy="62" r="14" stroke="currentColor" strokeWidth="4"/>
      <path d="M62 62h4" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
      <path d="M50 80c4 4 24 4 28 0" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M94 36l3-5 5-3-5-3-3-5-3 5-5 3 5 3 3 5z" fill="currentColor" fillOpacity="0.9"/>
      <path d="M30 104h16c6 0 10-4 10-10s-4-10-10-10H36v20m40-20h-8v20h8c6 0 10-4 10-10s-4-10-10-10z" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}


