"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Share2, Eye, TrendingUp, Star, Clock } from 'lucide-react'
import { SearchAndFilter } from '@/components/SearchAndFilter'
import type { PostResponse, ListPostsResponse } from '@/types/post'

export function Feed() {
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/posts')
        if (!response.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = (await response.json()) as ListPostsResponse
        setPosts(data.posts)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch posts')
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likesCount: data.liked ? post.likesCount + 1 : post.likesCount - 1
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Error liking post:', err)
    }
  }

  const handleBookmark = async (postId: string) => {
    try {
      const response = await fetch('/api/interactions/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })
      
      if (response.ok) {
        const data = await response.json()
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                bookmarksCount: data.bookmarked ? post.bookmarksCount + 1 : post.bookmarksCount - 1
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Error bookmarking post:', err)
    }
  }

  const handleShare = async (postId: string) => {
    try {
      const response = await fetch('/api/interactions/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })
      
      if (response.ok) {
        setPosts(posts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                sharesCount: post.sharesCount + 1
              }
            : post
        ))
      }
    } catch (err) {
      console.error('Error sharing post:', err)
    }
  }

  const handleSearch = async (params: { search: string; model: string; purpose: string; sortBy: string; order: string }) => {
    try {
      setLoading(true)
      const searchParams = new URLSearchParams()
      if (params.search) searchParams.set('search', params.search)
      if (params.model) searchParams.set('model', params.model)
      if (params.purpose) searchParams.set('purpose', params.purpose)
      if (params.sortBy) searchParams.set('sortBy', params.sortBy)
      if (params.order) searchParams.set('order', params.order)

      const response = await fetch(`/api/posts?${searchParams.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to search posts')
      }
      const data = (await response.json()) as ListPostsResponse
      setPosts(data.posts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search posts')
    } finally {
      setLoading(false)
    }
  }

  // Create featured sections from real data
  const featuredSections = [
    {
      title: 'Most Popular This Week',
      icon: TrendingUp,
      posts: posts.slice(0, 2)
    },
    {
      title: 'Trending in Code',
      icon: Star,
      posts: posts.filter(post => post.purpose === 'Code Review').slice(0, 2)
    },
    {
      title: 'Latest Posts',
      icon: Clock,
      posts: posts.slice(0, 2)
    }
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search and Filter */}
      <SearchAndFilter onSearch={handleSearch} />
      
      {/* Featured Sections */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Discover Prompts</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredSections.map((section, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <section.icon className="h-5 w-5 text-brand-500" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.posts.slice(0, 2).map((post) => (
                    <div key={post.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{post.likesCount} likes</span>
                        <span>{post.model}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Posts</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Latest</Button>
            <Button variant="outline" size="sm">Popular</Button>
            <Button variant="outline" size="sm">Trending</Button>
          </div>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts found. Be the first to share a prompt!</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                        <span className="text-brand-600 font-semibold">
                          {post.author.firstName?.charAt(0) || post.author.username.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {post.author.firstName && post.author.lastName 
                            ? `${post.author.firstName} ${post.author.lastName}`
                            : post.author.username
                          }
                        </h3>
                        <p className="text-sm text-muted-foreground">@{post.author.username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-xs">
                        {post.model}
                      </span>
                      <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                        {post.purpose}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="text-xl font-semibold mb-3">{post.title}</h4>
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likesCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(post.id)}
                      >
                        <Bookmark className="h-4 w-4 mr-1" />
                        {post.bookmarksCount}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post.id)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        {post.sharesCount}
                      </Button>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        {post.viewsCount}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : 'Recently'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
