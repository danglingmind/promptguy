"use client"

import { useState, useEffect, useCallback, memo, Suspense } from 'react'
import { useFilters } from '@/contexts/FilterContext'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Share2, Eye, TrendingUp, Star, Clock, X, Copy } from 'lucide-react'
import { SearchAndFilter } from '@/components/SearchAndFilter'
import type { PostResponse, ListPostsResponse } from '@/types/post'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FEED_FILTERS, type FeedFilterKey } from '@/lib/filters/feed-filters'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { LandingPage } from '@/components/LandingPage'
import { PostsList } from '@/components/PostsList'
import Image from 'next/image'
import { toast } from 'sonner'

export function Feed() {
  return (
    <>
      <SignedOut>
        <PublicFeed />
      </SignedOut>
      <SignedIn>
        <AuthenticatedFeed />
      </SignedIn>
    </>
  )
}

// Memoized SearchAndFilter component
const SearchSection = memo(({ onSearch }: { onSearch: (params: { search: string; model: string; purpose: string; sortBy: string; order: string }) => void }) => {
  return <SearchAndFilter onSearch={onSearch} />
})

SearchSection.displayName = 'SearchSection'

// Memoized FeaturedSections component
const FeaturedSections = memo(({ onApplyFilter }: { onApplyFilter: (filterKey: FeedFilterKey) => void }) => {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex flex-wrap gap-2 md:gap-3">
        {Object.entries(FEED_FILTERS).map(([key, filter]) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => onApplyFilter(key as FeedFilterKey)}
            className="text-xs md:text-sm"
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  )
})

FeaturedSections.displayName = 'FeaturedSections'

// Filter controls component
const FilterControls = ({ 
  activeFilters, 
  onRemoveFilter, 
  onApplySort 
}: { 
  activeFilters: Array<{ key: string; label: string }>
  onRemoveFilter: (key: string) => void
  onApplySort: (key: string) => void
}) => {
  if (activeFilters.length === 0) return null

  return (
    <div className="mb-4 md:mb-6">
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter) => (
          <div
            key={filter.key}
            className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-xs md:text-sm"
          >
            <span>{filter.label}</span>
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className="hover:bg-primary/20 rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

FilterControls.displayName = 'FilterControls'

// Separate component for posts section that will re-render
const PostsSection = memo(({ 
  posts, 
  loading, 
  hasMore, 
  onLoadMore, 
  onPostClick, 
  onLike, 
  onBookmark, 
  onShare,
  activeFilters,
  onRemoveFilter,
  onApplySort
}: {
  posts: PostResponse[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onPostClick: (post: PostResponse) => void
  onLike: (postId: string) => void
  onBookmark: (postId: string) => void
  onShare: (postId: string) => void
  activeFilters: Array<{ key: string; label: string }>
  onRemoveFilter: (key: string) => void
  onApplySort: (key: string) => void
}) => {
  return (
    <div className="space-y-4 md:space-y-6">
      <FilterControls 
        activeFilters={activeFilters}
        onRemoveFilter={onRemoveFilter}
        onApplySort={onApplySort}
      />

      <PostsList
        posts={posts}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        onPostClick={onPostClick}
        onLike={onLike}
        onBookmark={onBookmark}
        onShare={onShare}
      />
    </div>
  )
})

PostsSection.displayName = 'PostsSection'

// Custom hook for posts data management
const usePostsData = () => {
  const { filterParams, applyFilter, applySearch } = useFilters()
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [page, setPage] = useState<number>(1)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  const fetchPostsOnce = useCallback(async (signal?: AbortSignal, mode: 'append' | 'replace' = 'replace', currentFilterParams = filterParams) => {
    const headers: Record<string, string> = {}
    const params = new URLSearchParams()
    params.set('page', String(mode === 'append' ? page + 1 : 1))
    if (currentFilterParams.sortBy) params.set('sortBy', currentFilterParams.sortBy)
    if (currentFilterParams.order) params.set('order', currentFilterParams.order)
    if (currentFilterParams.purpose) params.set('purpose', currentFilterParams.purpose as string)
    if (currentFilterParams.search) params.set('search', currentFilterParams.search as string)
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
  }, [page])

  // Initial fetch only - no polling to avoid overriding filters
  useEffect(() => {
    let aborted = false

    async function initialFetch() {
      try {
        setLoading(true)
        await fetchPostsOnce()
        setLoading(false)
      } catch (err) {
        if (!aborted) setError(err instanceof Error ? err.message : 'Failed to fetch posts')
      }
    }

    initialFetch()
    return () => { aborted = true }
  }, []) // Empty dependency array - only run once on mount

  // Separate polling effect that respects current filters
  useEffect(() => {
    if (loading) return

    const interval = setInterval(async () => {
      try {
        await fetchPostsOnce(undefined, 'replace')
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 30000) // Poll every 30 seconds

    return () => clearInterval(interval)
  }, [loading, fetchPostsOnce])

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return
    try {
      setLoading(true)
      await fetchPostsOnce(undefined, 'append')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts')
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, fetchPostsOnce])

  const handleApplyFilter = useCallback((filterKey: FeedFilterKey) => {
    const filter = FEED_FILTERS[filterKey]
    if (filter) {
      applyFilter(filter.getQueryParams())
    }
    // Reset posts when filter changes
    setPosts([])
    setPage(1)
    setHasMore(true)
    setError('')
  }, [applyFilter])

  const handleApplySearch = useCallback((params: { search: string; model: string; purpose: string; sortBy: string; order: string }) => {
    applySearch(params)
    // Reset posts when search changes
    setPosts([])
    setPage(1)
    setHasMore(true)
    setError('')
  }, [applySearch])

  return { posts, loading, hasMore, error, loadMore, applyFilter: handleApplyFilter, applySearch: handleApplySearch }
}

// Public feed component for non-authenticated users
function PublicFeed() {
  const [open, setOpen] = useState<boolean>(false)
  const [activePost, setActivePost] = useState<PostResponse | null>(null)
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; label: string }>>([])
  
  // Get context values
  const { filterParams, applyFilter, applySearch } = useFilters()
  
  // Use custom hook for posts data - this isolates all filter logic
  const { posts, loading, hasMore, error, loadMore, applyFilter: handleApplyFilter, applySearch: handleApplySearch } = usePostsData()

  const handlePostClick = useCallback(async (post: PostResponse) => {
    setActivePost(post)
    setOpen(true)
    
    // Track view for the post
    try {
      await fetch(`/api/posts/${post.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error tracking view:', error)
      // Don't show error to user, just log it
    }
  }, [])

  const handleLike = async (postId: string) => {
    // For public users, show a message to sign in
    toast.info('Please sign in to like posts')
  }

  const handleBookmark = async (postId: string) => {
    // For public users, show a message to sign in
    toast.info('Please sign in to bookmark posts')
  }

  const handleShare = useCallback(async (postId: string) => {
    try {
      const url = `${window.location.origin}/posts/${postId}`
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      console.error('Error sharing post:', err)
      toast.error('Failed to copy link')
    }
  }, [])

  const handleSearch = useCallback((params: { search: string; model: string; purpose: string; sortBy: string; order: string }) => {
    handleApplySearch(params)
  }, [handleApplySearch])

  const handleApplyFilterCallback = useCallback((filterKey: FeedFilterKey) => {
    const filter = FEED_FILTERS[filterKey]
    if (filter) {
      handleApplyFilter(filterKey)
      setActiveFilters(prev => {
        const exists = prev.some(f => f.key === filterKey)
        if (exists) return prev
        return [...prev, { key: filterKey, label: filter.label }]
      })
    }
  }, [handleApplyFilter])

  const handleRemoveFilter = useCallback((key: string) => {
    setActiveFilters(prev => prev.filter(f => f.key !== key))
    // Reset the specific filter
    if (key === 'trending') {
      handleApplyFilter('trending' as FeedFilterKey)
    } else if (key === 'latest') {
      handleApplyFilter('latest' as FeedFilterKey)
    }
  }, [handleApplyFilter])

  const handleApplySort = useCallback((key: string) => {
    // Handle sort logic here
    console.log('Applying sort:', key)
  }, [])

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      <SearchSection onSearch={handleSearch} />
      
      {/* Featured Sections */}
      <FeaturedSections onApplyFilter={handleApplyFilterCallback} />

      {/* Main Feed - partial prerender target */}
      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading posts…</div>}>
        <PostsSection
          posts={posts}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onPostClick={handlePostClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onApplySort={handleApplySort}
        />
      </Suspense>
      
      {/* Post Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {activePost?.title}
            </DialogTitle>
          </DialogHeader>
          {activePost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>By {activePost.author?.username || 'Anonymous'}</span>
                <span>•</span>
                <span>{activePost.createdAt ? new Date(activePost.createdAt).toLocaleDateString() : 'Recently'}</span>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {activePost.content}
                </pre>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{activePost.viewsCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{activePost.likesCount || 0} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" />
                    <span>{activePost.bookmarksCount || 0} bookmarks</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike(activePost.id)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookmark(activePost.id)}
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    Bookmark
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(activePost.id)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AuthenticatedFeed() {
  const [open, setOpen] = useState<boolean>(false)
  const [activePost, setActivePost] = useState<PostResponse | null>(null)
  const [activeFilters, setActiveFilters] = useState<Array<{ key: string; label: string }>>([])
  
  // Get context values
  const { filterParams, applyFilter, applySearch } = useFilters()
  
  // Use custom hook for posts data - this isolates all filter logic
  const { posts, loading, hasMore, error, loadMore, applyFilter: handleApplyFilter, applySearch: handleApplySearch } = usePostsData()

  const handlePostClick = useCallback(async (post: PostResponse) => {
    setActivePost(post)
    setOpen(true)
    
    // Track view for the post
    try {
      await fetch(`/api/posts/${post.id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error tracking view:', error)
      // Don't show error to user, just log it
    }
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

  const handleShare = useCallback(async (postId: string) => {
    try {
      const url = `${window.location.origin}/posts/${postId}`
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      console.error('Error sharing post:', err)
      toast.error('Failed to copy link')
    }
  }, [])

  const handleSearch = useCallback((params: { search: string; model: string; purpose: string; sortBy: string; order: string }) => {
    handleApplySearch(params)
  }, [handleApplySearch])

  const handleApplyFilterCallback = useCallback((filterKey: FeedFilterKey) => {
    const filter = FEED_FILTERS[filterKey]
    if (filter) {
      handleApplyFilter(filterKey)
      setActiveFilters(prev => {
        const exists = prev.some(f => f.key === filterKey)
        if (exists) return prev
        return [...prev, { key: filterKey, label: filter.label }]
      })
    }
  }, [handleApplyFilter])

  const handleRemoveFilter = useCallback((key: string) => {
    setActiveFilters(prev => prev.filter(f => f.key !== key))
    // Reset the specific filter
    if (key === 'trending') {
      handleApplyFilter('trending' as FeedFilterKey)
    } else if (key === 'latest') {
      handleApplyFilter('latest' as FeedFilterKey)
    }
  }, [handleApplyFilter])

  const handleApplySort = useCallback((key: string) => {
    // Handle sort logic here
    console.log('Applying sort:', key)
  }, [])

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
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
      <SearchSection onSearch={handleSearch} />
      
      {/* Featured Sections */}
      <FeaturedSections onApplyFilter={handleApplyFilterCallback} />

      {/* Main Feed - partial prerender target */}
      <Suspense fallback={<div className="py-8 text-center text-muted-foreground">Loading posts…</div>}>
        <PostsSection
          posts={posts}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={loadMore}
          onPostClick={handlePostClick}
          onLike={handleLike}
          onBookmark={handleBookmark}
          onShare={handleShare}
          activeFilters={activeFilters}
          onRemoveFilter={handleRemoveFilter}
          onApplySort={handleApplySort}
        />
      </Suspense>
      
      {/* Post Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {activePost?.title}
            </DialogTitle>
          </DialogHeader>
          {activePost && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>By {activePost.author?.username || 'Anonymous'}</span>
                <span>•</span>
                <span>{activePost.createdAt ? new Date(activePost.createdAt).toLocaleDateString() : 'Recently'}</span>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg">
                  {activePost.content}
                </pre>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{activePost.viewsCount || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{activePost.likesCount || 0} likes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-4 w-4" />
                    <span>{activePost.bookmarksCount || 0} bookmarks</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLike(activePost.id)}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    Like
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBookmark(activePost.id)}
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    Bookmark
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(activePost.id)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}