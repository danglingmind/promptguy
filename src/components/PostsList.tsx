"use client"

import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Share2, Eye, Clock } from 'lucide-react'
import type { PostResponse } from '@/types/post'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'


interface PostsListProps {
  posts: PostResponse[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onPostClick: (post: PostResponse) => void
  onLike: (postId: string) => void
  onBookmark: (postId: string) => void
  onShare: (postId: string) => void
}

export const PostsList = memo(({ 
  posts, 
  loading, 
  hasMore, 
  onLoadMore, 
  onPostClick, 
  onLike, 
  onBookmark, 
  onShare 
}: PostsListProps) => {
  return (
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
            onClick={() => onPostClick(post)}
          >
            <CardHeader className="pb-3 md:pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base md:text-lg font-semibold line-clamp-2 leading-tight">
                    {post.title}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {post.model || 'Unknown Model'}
                    </Badge>
                    {post.purpose && (
                      <Badge variant="outline" className="text-xs">
                        {post.purpose}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground flex-shrink-0">
                  <Eye className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{post.viewsCount || 0}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground line-clamp-3">
                  {post.content}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs md:text-sm text-muted-foreground">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onLike(post.id)
                      }}
                      className="flex items-center gap-1 hover:text-red-500 transition-colors"
                    >
                      <Heart className={`h-3 w-3 md:h-4 md:w-4 ${post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''}`} />
                      <span>{post.likesCount || 0}</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onBookmark(post.id)
                      }}
                      className="flex items-center gap-1 hover:text-yellow-500 transition-colors"
                    >
                      <Bookmark className={`h-3 w-3 md:h-4 md:w-4 ${post.isBookmarkedByCurrentUser ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      <span>{post.bookmarksCount || 0}</span>
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onShare(post.id)
                      }}
                      className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                    >
                      <Share2 className="h-3 w-3 md:h-4 md:w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    {post.author?.imageUrl && (
                      <Image
                        src={post.author.imageUrl}
                        alt={post.author.username || 'User'}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-xs md:text-sm font-medium">
                      {post.author?.username || 'Anonymous'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{post.createdAt ? new Date(post.createdAt).toISOString().split('T')[0] : 'Recently'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
      {hasMore && (
        <div className="flex justify-center py-6">
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={(e) => {
              e.stopPropagation()
              onLoadMore()
            }}
          >
            {loading ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  )
})

PostsList.displayName = 'PostsList'
