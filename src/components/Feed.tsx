"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, Bookmark, Share2, Eye, TrendingUp, Star, Clock } from 'lucide-react'
import { SearchAndFilter } from '@/components/SearchAndFilter'

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    title: 'Advanced Code Review Prompt',
    content: 'Act as a senior software engineer. Review the following code for security vulnerabilities, performance issues, and best practices...',
    author: {
      name: 'Alex Chen',
      username: '@alexchen',
      avatar: '/avatars/alex.jpg'
    },
    model: 'GPT-4',
    purpose: 'Code Review',
    tags: ['programming', 'security', 'best-practices'],
    likesCount: 142,
    bookmarksCount: 89,
    sharesCount: 23,
    viewsCount: 1205,
    createdAt: new Date('2024-01-15'),
    isLiked: false,
    isBookmarked: false
  },
  {
    id: '2',
    title: 'Creative Writing Assistant',
    content: 'You are a creative writing coach. Help me develop compelling characters with depth and realistic dialogue...',
    author: {
      name: 'Sarah Johnson',
      username: '@sarahwrites',
      avatar: '/avatars/sarah.jpg'
    },
    model: 'Claude-3',
    purpose: 'Creative Writing',
    tags: ['writing', 'creativity', 'storytelling'],
    likesCount: 98,
    bookmarksCount: 67,
    sharesCount: 15,
    viewsCount: 892,
    createdAt: new Date('2024-01-14'),
    isLiked: true,
    isBookmarked: false
  },
  {
    id: '3',
    title: 'Data Analysis Prompt',
    content: 'Analyze this dataset and provide insights on trends, patterns, and actionable recommendations...',
    author: {
      name: 'Mike Rodriguez',
      username: '@mikedata',
      avatar: '/avatars/mike.jpg'
    },
    model: 'GPT-4',
    purpose: 'Data Analysis',
    tags: ['data-science', 'analytics', 'insights'],
    likesCount: 76,
    bookmarksCount: 45,
    sharesCount: 12,
    viewsCount: 634,
    createdAt: new Date('2024-01-13'),
    isLiked: false,
    isBookmarked: true
  }
]

const featuredSections = [
  {
    title: 'Most Popular This Week',
    icon: TrendingUp,
    posts: mockPosts.slice(0, 2)
  },
  {
    title: 'Trending in Code',
    icon: Star,
    posts: mockPosts.filter(post => post.purpose === 'Code Review')
  },
  {
    title: 'Latest Posts',
    icon: Clock,
    posts: mockPosts
  }
]

export function Feed() {
  const [posts, setPosts] = useState(mockPosts)

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1
          }
        : post
    ))
  }

  const handleBookmark = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isBookmarked: !post.isBookmarked,
            bookmarksCount: post.isBookmarked ? post.bookmarksCount - 1 : post.bookmarksCount + 1
          }
        : post
    ))
  }

  const handleShare = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            sharesCount: post.sharesCount + 1
          }
        : post
    ))
  }

  const handleSearch = (params: { search: string; model: string; purpose: string; sortBy: string; order: string }) => {
    // TODO: Implement actual API call
    console.log('Search params:', params)
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
          {posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center">
                      <span className="text-brand-600 font-semibold">
                        {post.author.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{post.author.name}</h3>
                      <p className="text-sm text-muted-foreground">{post.author.username}</p>
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
                      className={post.isLiked ? 'text-red-500' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
                      {post.likesCount}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleBookmark(post.id)}
                      className={post.isBookmarked ? 'text-yellow-500' : ''}
                    >
                      <Bookmark className={`h-4 w-4 mr-1 ${post.isBookmarked ? 'fill-current' : ''}`} />
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
                    {post.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
