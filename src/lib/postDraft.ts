// Utility functions for storing and retrieving post drafts
export interface PostDraft {
  title: string
  content: string
  model: string
  purpose: string
  tags: string[]
  isPublic: boolean
}

const DRAFT_KEY = 'postguy_post_draft'

export const savePostDraft = (draft: PostDraft): void => {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch (error) {
    console.error('Failed to save post draft:', error)
  }
}

export const getPostDraft = (): PostDraft | null => {
  try {
    const draft = localStorage.getItem(DRAFT_KEY)
    return draft ? JSON.parse(draft) : null
  } catch (error) {
    console.error('Failed to retrieve post draft:', error)
    return null
  }
}

export const clearPostDraft = (): void => {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch (error) {
    console.error('Failed to clear post draft:', error)
  }
}
