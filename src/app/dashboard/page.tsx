"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Bookmark, Share2, Eye, Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'
import type { PostResponse } from '@/types/post'

interface UserPost extends PostResponse {
  isPublic: boolean
}

interface Bookmark {
  id: string
  post: PostResponse
}

interface DashboardStats {
  totalPosts: number
  totalLikes: number
  totalBookmarks: number
  totalViews: number
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('posts')
  const [userPosts, setUserPosts] = useState<UserPost[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalLikes: 0,
    totalBookmarks: 0,
    totalViews: 0
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // Fetch user data
  useEffect(() => {
    if (!user) return

    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch user posts
        const postsResponse = await fetch('/api/posts?userOnly=true')
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch user posts')
        }
        const postsData = await postsResponse.json()
        setUserPosts(postsData.posts || [])

        // Fetch bookmarks
        let bookmarksData: { bookmarks: Bookmark[] } = { bookmarks: [] }
        const bookmarksResponse = await fetch('/api/user/bookmarks')
        if (bookmarksResponse.ok) {
          bookmarksData = await bookmarksResponse.json()
          setBookmarks(bookmarksData.bookmarks || [])
        }

        // Calculate stats
        const totalLikes = postsData.posts?.reduce((sum: number, post: UserPost) => sum + post.likesCount, 0) || 0
        const totalViews = postsData.posts?.reduce((sum: number, post: UserPost) => sum + post.viewsCount, 0) || 0
        
        setStats({
          totalPosts: postsData.posts?.length || 0,
          totalLikes,
          totalBookmarks: bookmarksData.bookmarks?.length || 0,
          totalViews
        })

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to access your dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Manage your prompts, bookmarks, and profile settings.
          </p>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading dashboard</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const handleDeletePost = (postId: string) => {
    setUserPosts(userPosts.filter(post => post.id !== postId))
  }

  const handleToggleVisibility = (postId: string) => {
    setUserPosts(userPosts.map(post => 
      post.id === postId 
        ? { ...post, isPublic: !post.isPublic }
        : post
    ))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName || user.username}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Plus className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Posts</p>
                  <p className="text-2xl font-bold">{stats.totalPosts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Heart className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Likes</p>
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bookmark className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bookmarks</p>
                  <p className="text-2xl font-bold">{stats.totalBookmarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts">My Posts</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* My Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Posts</h2>
              <Button asChild>
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Post
                </Link>
              </Button>
            </div>
            
            <div className="space-y-4">
              {userPosts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{post.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {post.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleVisibility(post.id)}
                        >
                          {post.isPublic ? 'Public' : 'Private'}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeletePost(post.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likesCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-4 w-4" />
                        {post.bookmarksCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {post.sharesCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {post.viewsCount}
                      </div>
                      <span className="ml-auto">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-4">
            <h2 className="text-xl font-semibold">Bookmarked Posts</h2>
            
            <div className="space-y-4">
              {bookmarks.map((bookmark) => (
                <Card key={bookmark.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{bookmark.post.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          by {bookmark.post.author.firstName && bookmark.post.author.lastName 
                            ? `${bookmark.post.author.firstName} ${bookmark.post.author.lastName}`
                            : bookmark.post.author.username
                          } ({bookmark.post.author.username})
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {bookmark.post.content}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {bookmark.post.likesCount}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-4 w-4" />
                        {bookmark.post.bookmarksCount}
                      </div>
                      <span className="ml-auto">
                        {bookmark.post.createdAt ? new Date(bookmark.post.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <h2 className="text-xl font-semibold">Account Settings</h2>
            
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Username
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {user.username || 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {user.emailAddresses[0]?.emailAddress || 'Not set'}
                  </p>
                </div>
                <Button variant="outline">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
