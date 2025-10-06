"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Share2, Eye, TrendingUp, Star, Clock, X } from 'lucide-react'
import { SearchAndFilter } from '@/components/SearchAndFilter'
import type { PostResponse, ListPostsResponse } from '@/types/post'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

export function Feed() {
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const [activePost, setActivePost] = useState<PostResponse | null>(null)
  const [filterParams, setFilterParams] = useState<{ sortBy?: string; order?: string; purpose?: string; search?: string }>({})
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; label: string }>>([])

  const refetchWithFilters = useCallback(async () => {
    const params = new URLSearchParams()
    params.set('page', '1')
    if (filterParams.sortBy) params.set('sortBy', filterParams.sortBy)
    if (filterParams.order) params.set('order', filterParams.order)
    if (filterParams.purpose) params.set('purpose', filterParams.purpose as string)
    if (filterParams.search) params.set('search', filterParams.search as string)
    setLoading(true)
    try {
      const res = await fetch(`/api/posts?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch posts')
      const data = (await res.json()) as ListPostsResponse
      setPosts(data.posts)
      setHasMore(Boolean(data.hasMore))
      setPage(1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }, [filterParams])

  // Fetch posts from API with HTTP caching (ETag) and gentle polling
  useEffect(() => {
    let aborted = false
    let etag: string | null = null

    async function fetchPostsOnce(signal?: AbortSignal, mode: 'append' | 'replace' = 'replace') {
      const headers: Record<string, string> = {}
      if (etag && mode === 'replace') headers['If-None-Match'] = etag
      const params = new URLSearchParams()
      params.set('page', String(mode === 'append' ? page + 1 : 1))
      if (filterParams.sortBy) params.set('sortBy', filterParams.sortBy)
      if (filterParams.order) params.set('order', filterParams.order)
      if (filterParams.purpose) params.set('purpose', filterParams.purpose as string)
      if (filterParams.search) params.set('search', filterParams.search as string)
      const res = await fetch(`/api/posts?${params.toString()}`, { headers, signal })
      if (res.status === 304) return // no changes
      if (!res.ok) throw new Error('Failed to fetch posts')
      etag = res.headers.get('ETag')
      const data = (await res.json()) as ListPostsResponse
      if (!aborted) {
        setHasMore(Boolean(data.hasMore))
        if (mode === 'append') {
          setPosts(prev => [...prev, ...data.posts])
          setPage(prev => prev + 1)
        } else {
          setPosts(data.posts)
          setPage(1)
        }
      }
    }

    async function loop() {
      try {
        setLoading(true)
        await fetchPostsOnce()
        setLoading(false)
      } catch (err) {
        if (!aborted) setError(err instanceof Error ? err.message : 'Failed to fetch posts')
      }

      // Gentle poll every 30s, visibility-aware
      const tick = async () => {
        if (document.visibilityState === 'visible') {
          try { await fetchPostsOnce() } catch {}
        }
      }
      const interval = setInterval(tick, 30000)
      const onVis = () => { if (document.visibilityState === 'visible') tick() }
      document.addEventListener('visibilitychange', onVis)

      return () => {
        clearInterval(interval)
        document.removeEventListener('visibilitychange', onVis)
      }
    }

    const controller = new AbortController()
    loop()
    return () => { aborted = true; controller.abort() }
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
      setFilterParams({
        search: params.search || undefined,
        purpose: params.purpose || undefined,
        sortBy: params.sortBy || undefined,
        order: params.order || undefined
      })
      setActiveFilters((prev) => {
        const next = prev.filter(f => !['search','purpose'].includes(f.key))
        if (params.search) next.push({ key: 'search', label: params.search })
        if (params.purpose) next.push({ key: 'purpose', label: params.purpose })
        return next
      })
      await refetchWithFilters()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search posts')
    } finally {
      setLoading(false)
    }
  }

  // Create featured sections from real data
  const featuredSections = [
    {
      title: 'Most Popular',
      icon: TrendingUp,
      apply: async () => {
        setFilterParams(prev => ({ ...prev, sortBy: 'likesCount', order: 'desc', search: undefined }))
        setActiveFilters(prev => [...prev.filter(f => f.key !== 'featured'), { key: 'featured', label: 'Most Popular' }])
        await refetchWithFilters()
      }
    },
    {
      title: 'Trending in Code',
      icon: Star,
      apply: async () => {
        setFilterParams({ purpose: 'Code Review', sortBy: 'likesCount', order: 'desc' })
        setActiveFilters(prev => [...prev.filter(f => f.key !== 'featured'), { key: 'featured', label: 'Trending in Code' }])
        await refetchWithFilters()
      }
    },
    {
      title: 'Latest Posts',
      icon: Clock,
      apply: async () => {
        setFilterParams(prev => ({ ...prev, sortBy: 'createdAt', order: 'desc', search: undefined, purpose: undefined }))
        setActiveFilters(prev => [...prev.filter(f => f.key !== 'featured'), { key: 'featured', label: 'Latest Posts' }])
        await refetchWithFilters()
      }
    }
  ]

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-4"></div>
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
            <Card key={index} className="bg-card/60 hover:bg-card shadow-sm hover:shadow-md transition-colors cursor-pointer" onClick={section.apply}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <section.icon className="h-5 w-5 text-primary" />
                  <span className="text-foreground">{section.title}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Feed */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">All Posts</h2>
            <div className="flex gap-2 flex-wrap">
              {activeFilters.map(f => (
                <Button key={`${f.key}-${f.label}`} variant="outline" size="sm" onClick={async () => {
                  setActiveFilters(prev => prev.filter(x => x.key !== f.key))
                  setFilterParams(prev => ({ ...prev, ...(f.key === 'featured' ? { sortBy: undefined, order: undefined, purpose: undefined } : { [f.key]: undefined as unknown as string }) }))
                  await refetchWithFilters()
                }}>
                  {f.label}
                  <X className="h-3 w-3 ml-2" />
                </Button>
              ))}
            </div>
          </div>
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
            <Card
              key={post.id}
              className="bg-card/60 hover:bg-card transition-colors shadow-sm hover:shadow-md cursor-pointer"
              onClick={async () => {
                setActivePost(post)
                setOpen(true)
                try {
                  await fetch(`/api/posts/${post.id}/view`, { method: 'POST' })
                } catch (e) {
                  // no-op
                }
              }}
            >
              <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <span className="text-primary font-semibold">
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
                    <Badge variant="secondary" className="rounded-full px-2 py-0 h-6">{post.model}</Badge>
                    <Badge className="rounded-full px-2 py-0 h-6" variant="outline">{post.purpose}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="text-xl font-semibold mb-3">{post.title}</h4>
                  <p className="text-muted-foreground mb-4 line-clamp-3 whitespace-pre-wrap min-h-[72px]">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs rounded-md">#{tag}</Badge>
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
          {hasMore && (
            <div className="flex justify-center py-6">
              <Button
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={async (e) => {
                  e.stopPropagation()
                  try {
                    setLoading(true)
                    await fetch(`/api/posts?page=${page + 1}`)
                    await fetchPostsOnce(undefined, 'append')
                  } finally {
                    setLoading(false)
                  }
                }}
              >
                {loading ? 'Loading…' : 'Load more'}
              </Button>
            </div>
          )}
        </div>
      </div>
    {/* Post Dialog */}
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setOpen(false); setActivePost(null) } }}>
      <DialogContent className="sm:max-w-2xl">
        {activePost && (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-2xl">{activePost.title}</DialogTitle>
            </DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {activePost.author.firstName?.charAt(0) || activePost.author.username.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">
                    {activePost.author.firstName && activePost.author.lastName
                      ? `${activePost.author.firstName} ${activePost.author.lastName}`
                      : activePost.author.username}
                  </h3>
                  <p className="text-sm text-muted-foreground">@{activePost.author.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="rounded-full px-2 py-0 h-6">{activePost.model}</Badge>
                <Badge className="rounded-full px-2 py-0 h-6" variant="outline">{activePost.purpose}</Badge>
              </div>
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {activePost.content}
            </p>
            <div className="flex flex-wrap gap-2">
              {activePost.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs rounded-md">#{tag}</Badge>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(activePost.id)}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {activePost.likesCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBookmark(activePost.id)}
                >
                  <Bookmark className="h-4 w-4 mr-1" />
                  {activePost.bookmarksCount}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(activePost.id)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  {activePost.sharesCount}
                </Button>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="h-4 w-4" />
                  {activePost.viewsCount}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {activePost.createdAt ? new Date(activePost.createdAt).toISOString().split('T')[0] : 'Recently'}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  )
}
