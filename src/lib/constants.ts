// Shared constants for dropdown options used across the application

export const MODEL_OPTIONS = [
  'All models',
  'GPT-4',
  'GPT-3.5',
  'Claude-3',
  'Claude-2',
  'Gemini Pro',
  'Stable Diffusion',
  'Midjourney',
  'DALL-E',
  'Other'
] as const

export const PURPOSE_OPTIONS = [
  'Code Review',
  'Creative Writing',
  'Data Analysis',
  'Image Generation',
  'Productivity',
  'Learning',
  'Research',
  'Marketing',
  'Coding',
  'Other'
] as const

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Latest' },
  { value: 'likesCount', label: 'Most Liked' },
  { value: 'bookmarksCount', label: 'Most Bookmarked' },
  { value: 'viewsCount', label: 'Most Viewed' }
] as const

// Type definitions for better TypeScript support
export type ModelOption = typeof MODEL_OPTIONS[number]
export type PurposeOption = typeof PURPOSE_OPTIONS[number]
export type SortOption = typeof SORT_OPTIONS[number]
