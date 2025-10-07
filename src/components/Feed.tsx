"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Share2, Eye, TrendingUp, Star, Clock, X, Copy } from 'lucide-react'
import { SearchAndFilter } from '@/components/SearchAndFilter'
import type { PostResponse, ListPostsResponse } from '@/types/post'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FEED_FILTERS, type FeedFilterKey } from '@/lib/filters/feed-filters'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { LandingPage } from '@/components/LandingPage'
import Image from 'next/image'
import { toast } from 'sonner'

export function Feed() {
  return (
    <>
      <SignedOut>
        <LandingPage />
      </SignedOut>
      <SignedIn>
        <AuthenticatedFeed />
      </SignedIn>
    </>
  )
}

function AuthenticatedFeed() {
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

  const fetchPostsOnce = useCallback(async (signal?: AbortSignal, mode: 'append' | 'replace' = 'replace') => {
    const headers: Record<string, string> = {}
    const params = new URLSearchParams()
    params.set('page', String(mode === 'append' ? page + 1 : 1))
    if (filterParams.sortBy) params.set('sortBy', filterParams.sortBy)
    if (filterParams.order) params.set('order', filterParams.order)
    if (filterParams.purpose) params.set('purpose', filterParams.purpose as string)
    if (filterParams.search) params.set('search', filterParams.search as string)
    const res = await fetch(`/api/posts?${params.toString()}`, { headers, signal })
    if (res.status === 304) return // no changes
    if (!res.ok) throw new Error('Failed to fetch posts')
    const data = (await res.json()) as ListPostsResponse
    setHasMore(Boolean(data.hasMore))
    if (mode === 'append') {
      setPosts(prev => [...prev, ...data.posts])
      setPage(prev => prev + 1)
    } else {
      setPosts(data.posts)
      setPage(1)
    }
  }, [page, filterParams])

  // Fetch posts from API with HTTP caching (ETag) and gentle polling
  useEffect(() => {
    let aborted = false

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
  }, [fetchPostsOnce])

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
                likesCount: data.liked ? post.likesCount + 1 : post.likesCount - 1,
                isLikedByCurrentUser: data.liked
              }
            : post
        ))
        setActivePost(prev => prev && prev.id === postId 
          ? { 
              ...prev, 
              likesCount: data.liked ? prev.likesCount + 1 : prev.likesCount - 1,
              isLikedByCurrentUser: data.liked
            } 
          : prev
        )
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
                bookmarksCount: data.bookmarked ? post.bookmarksCount + 1 : post.bookmarksCount - 1,
                isBookmarkedByCurrentUser: data.bookmarked
              }
            : post
        ))
        setActivePost(prev => prev && prev.id === postId 
          ? { 
              ...prev, 
              bookmarksCount: data.bookmarked ? prev.bookmarksCount + 1 : prev.bookmarksCount - 1,
              isBookmarkedByCurrentUser: data.bookmarked
            } 
          : prev
        )
      }
    } catch (err) {
      console.error('Error bookmarking post:', err)
    }
  }

  const handleShare = async (postId: string) => {
    try {
      const url = `${window.location.origin}/?post=${postId}`
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        const ta = document.createElement('textarea')
        ta.value = url
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
      }
      toast.success('Link copied to clipboard')
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

  // Auto-open dialog when deep-linked via /?post=<id>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const postId = params.get('post')
    if (!postId) return
    ;(async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`)
        if (res.status === 401) {
          const redirectUrl = encodeURIComponent(`${window.location.origin}/?post=${postId}`)
          window.location.href = `/sign-in?redirect_url=${redirectUrl}`
          return
        }
        if (!res.ok) return
        const data = (await res.json()) as PostResponse
        setActivePost(data)
        setOpen(true)
      } catch {
        // ignore
      }
    })()
  }, [])

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
    <div className="max-w-4xl mx-auto px-4 md:px-0">
      {/* Search and Filter */}
      <SearchAndFilter onSearch={handleSearch} />
      
      {/* Featured Sections */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Discover Prompts</h2>
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {featuredSections.map((section, index) => (
            <Card key={index} className="bg-card/60 hover:bg-card shadow-sm hover:shadow-md transition-colors cursor-pointer" onClick={section.apply}>
              <CardHeader className="pb-3 md:pb-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <section.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  <span className="text-foreground">{section.title}</span>
                </CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Feed */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold">All Posts</h2>
            <div className="flex gap-2 flex-wrap">
              {activeFilters.map(f => (
                <Button key={`${f.key}-${f.label}`} variant="outline" size="sm" className="text-xs" onClick={async () => {
                  setActiveFilters(prev => prev.filter(x => x.key !== f.key))
                  setFilterParams(prev => ({ ...prev, ...(f.key === 'featured' ? { sortBy: undefined, order: undefined, purpose: undefined } : { [f.key]: undefined as unknown as string }) }))
                  await refetchWithFilters()
                }}>
                  {f.label}
                  <X className="h-3 w-3 ml-1" />
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['latest','popular','trending'] as FeedFilterKey[]).map(key => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  const strat = FEED_FILTERS[key]
                  const next = strat.getQueryParams()
                  setFilterParams(prev => ({ ...prev, ...next }))
                  setActiveFilters(prev => [
                    ...prev.filter(f => f.key !== 'featured' && f.key !== 'sort'),
                    { key: 'sort', label: strat.label }
                  ])
                  await refetchWithFilters()
                }}
              >
                {FEED_FILTERS[key].label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-muted-foreground text-sm md:text-base">No posts found. Be the first to share a prompt!</p>
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
                } catch {
                  // no-op
                }
              }}
            >
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                      {post.author.imageUrl ? (
                        <Image
                          src={post.author.imageUrl}
                          alt={post.author.username}
                          width={40}
                          height={40}
                          className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-semibold text-sm md:text-base">
                            {post.author.firstName?.charAt(0) || post.author.username.charAt(0)}
                          </span>
                        </div>
                      )}
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm md:text-base truncate">
                          {post.author.firstName && post.author.lastName 
                            ? `${post.author.firstName} ${post.author.lastName}`
                            : post.author.username
                          }
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">@{post.author.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground flex-shrink-0">
                    <Badge variant="secondary" className="rounded-full px-1 md:px-2 py-0 h-5 md:h-6 text-xs">{post.model}</Badge>
                    <Badge className="rounded-full px-1 md:px-2 py-0 h-5 md:h-6 text-xs" variant="outline">{post.purpose}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3 leading-tight">{post.title}</h4>
                  <p className="text-muted-foreground mb-3 md:mb-4 line-clamp-3 whitespace-pre-wrap text-sm md:text-base leading-relaxed">{post.content}</p>
                  
                <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs rounded-md">#{tag}</Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground" onClick={(e) => { e.stopPropagation(); handleLike(post.id) }} aria-label="Like">
                      <Heart className={`h-3 w-3 md:h-4 md:w-4 ${post.isLikedByCurrentUser ? 'text-red-500 fill-red-500' : ''}`} />
                      <span>{post.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground" onClick={(e) => { e.stopPropagation(); handleBookmark(post.id) }} aria-label="Bookmark">
                      <Bookmark className={`h-3 w-3 md:h-4 md:w-4 ${post.isBookmarkedByCurrentUser ? 'text-amber-500 fill-amber-500' : ''}`} />
                      <span>{post.bookmarksCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{post.viewsCount}</span>
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-foreground ml-4 md:ml-6" onClick={(e) => { e.stopPropagation(); handleShare(post.id) }} aria-label="Share">
                      <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                    </div>
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground flex-shrink-0">
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
          <div className="space-y-4 relative">
            <DialogHeader>
              <DialogTitle className="text-2xl">{activePost.title}</DialogTitle>
            </DialogHeader>
            {/* Date at top-right under the close icon */}
            <div className="absolute top-4 right-2 text-xs text-muted-foreground">
              {activePost.createdAt ? new Date(activePost.createdAt).toISOString().split('T')[0] : 'Recently'}
            </div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {activePost.author.imageUrl ? (
                  <Image
                    src={activePost.author.imageUrl}
                    alt={activePost.author.username}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-primary font-semibold">
                      {activePost.author.firstName?.charAt(0) || activePost.author.username.charAt(0)}
                    </span>
                  </div>
                )}
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
            <div className="relative rounded-md bg-muted/60 border border-border/60 overflow-x-auto">
              <Copy
                className="h-4 w-4 absolute top-2 right-2 cursor-pointer text-muted-foreground hover:text-foreground"
                role="button"
                aria-label="Copy post"
                onClick={async () => {
                  const text = `${activePost.title}\n\n${activePost.content}`
                  try {
                    await navigator.clipboard.writeText(text)
                    toast.success('Post copied to clipboard')
                  } catch {
                    const ta = document.createElement('textarea')
                    ta.value = text
                    document.body.appendChild(ta)
                    ta.select()
                    document.execCommand('copy')
                    document.body.removeChild(ta)
                    toast.success('Post copied to clipboard')
                  }
                }}
              />
              <pre className="p-4 pr-8 text-sm leading-6 whitespace-pre-wrap">
                <code>{activePost.content}</code>
              </pre>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePost.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs rounded-md">#{tag}</Badge>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 pr-8">
              <div className="flex items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-1 cursor-pointer hover:text-foreground" onClick={() => handleLike(activePost.id)} aria-label="Like">
                  <Heart className={`h-3 w-3 md:h-4 md:w-4 ${activePost.isLikedByCurrentUser ? 'text-red-500 fill-red-500' : ''}`} />
                  <span>{activePost.likesCount}</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-foreground" onClick={() => handleBookmark(activePost.id)} aria-label="Bookmark">
                  <Bookmark className={`h-3 w-3 md:h-4 md:w-4 ${activePost.isBookmarkedByCurrentUser ? 'text-amber-500 fill-amber-500' : ''}`} />
                  <span>{activePost.bookmarksCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{activePost.viewsCount}</span>
                </div>
                <div className="flex items-center gap-1 cursor-pointer hover:text-foreground ml-4 md:ml-6" onClick={() => handleShare(activePost.id)} aria-label="Share">
                  <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                </div>
              </div>
              {/* Date moved to top-right */}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
    </div>
  )
}
