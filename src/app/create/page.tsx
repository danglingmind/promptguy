"use client"

import { useState } from 'react'
import type { CreatePostRequestBody, PostResponse } from '@/types/post'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser } from '@clerk/nextjs'
import { ArrowLeft, Plus, X } from 'lucide-react'
import Link from 'next/link'

const modelOptions = [
  'GPT-4',
  'GPT-3.5',
  'Claude-3',
  'Claude-2',
  'Gemini Pro',
  'Stable Diffusion',
  'Midjourney',
  'DALL-E',
  'Other'
]

const purposeOptions = [
  'Code Review',
  'Creative Writing',
  'Data Analysis',
  'Image Generation',
  'Productivity',
  'Learning',
  'Research',
  'Marketing',
  'Other'
]

export default function CreatePost() {
  const { user } = useUser()
  const router = useRouter()
  const [formData, setFormData] = useState<CreatePostRequestBody>({
    title: '',
    content: '',
    model: '',
    purpose: '',
    tags: [],
    isPublic: true
  })
  const [tagInput, setTagInput] = useState<string>('')
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!formData.title || !formData.content || !formData.model || !formData.purpose) {
      setError('Please fill all required fields')
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData satisfies CreatePostRequestBody)
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data?.error || 'Failed to create post')
      }
      const post = (await res.json()) as PostResponse
      // Redirect to feeds page after success
      router.push('/')
      return post
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to create posts</h1>
          <p className="text-muted-foreground mb-6">
            You need to be signed in to share your prompts with the community.
          </p>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Button variant="ghost" size="sm" asChild className="self-start">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Link>
          </Button>
          <h1 className="text-xl md:text-2xl font-bold">Create New Prompt</h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg md:text-xl">Share Your Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Give your prompt a descriptive title"
                  className="text-sm md:text-base"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                  Prompt Content *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your prompt here. Be specific and clear about what you want the AI to do..."
                  className="w-full min-h-[150px] md:min-h-[200px] p-3 text-sm md:text-base border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {/* Model Selection */}
              <div>
                <label htmlFor="model" className="block text-xs md:text-sm font-medium mb-1 md:mb-2">
                  AI Model *
                </label>
                <select
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full p-2 md:p-3 text-sm md:text-base border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select a model</option>
                  {modelOptions.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-medium mb-2">
                  Purpose *
                </label>
                <select
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="w-full p-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select a purpose</option>
                  {purposeOptions.map((purpose) => (
                    <option key={purpose} value={purpose}>{purpose}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Visibility */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="rounded border-input"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Make this prompt public
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? 'Sharing…' : 'Share Prompt'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
