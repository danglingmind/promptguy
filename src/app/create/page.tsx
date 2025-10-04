"use client"

import { useState } from 'react'
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
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    model: '',
    purpose: '',
    tags: [] as string[],
    isPublic: true
  })
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement post creation logic
    console.log('Creating post:', formData)
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Feed
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Create New Prompt</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Share Your Prompt</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Give your prompt a descriptive title"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  Prompt Content *
                </label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your prompt here. Be specific and clear about what you want the AI to do..."
                  className="w-full min-h-[200px] p-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                />
              </div>

              {/* Model Selection */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium mb-2">
                  AI Model *
                </label>
                <select
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full p-3 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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
                <Button type="submit" className="flex-1">
                  Share Prompt
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
