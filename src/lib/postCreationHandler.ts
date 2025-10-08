import { getPostDraft, clearPostDraft } from './postDraft'

export const handlePostCreationAfterAuth = async (): Promise<boolean> => {
  const draft = getPostDraft()
  if (!draft) return false

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft)
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create post')
    }

    // Clear draft after successful creation
    clearPostDraft()
    return true
  } catch (error) {
    console.error('Failed to create post after authentication:', error)
    return false
  }
}
