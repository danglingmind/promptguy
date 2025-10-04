"use client"

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, Bookmark, Share2, Eye, Edit, Trash2, Plus } from 'lucide-react'
import Link from 'next/link'

// Mock data for user's posts
const mockUserPosts = [
  {
    id: '1',
    title: 'Advanced Code Review Prompt',
    content: 'Act as a senior software engineer. Review the following code for security vulnerabilities...',
    model: 'GPT-4',
    purpose: 'Code Review',
    tags: ['programming', 'security'],
    likesCount: 142,
    bookmarksCount: 89,
    sharesCount: 23,
    viewsCount: 1205,
    createdAt: new Date('2024-01-15'),
    isPublic: true
  },
  {
    id: '2',
    title: 'Creative Writing Assistant',
    content: 'You are a creative writing coach. Help me develop compelling characters...',
    model: 'Claude-3',
    purpose: 'Creative Writing',
    tags: ['writing', 'creativity'],
    likesCount: 98,
    bookmarksCount: 67,
    sharesCount: 15,
    viewsCount: 892,
    createdAt: new Date('2024-01-14'),
    isPublic: true
  }
]

const mockBookmarks = [
  {
    id: '1',
    post: {
      id: '3',
      title: 'Data Analysis Prompt',
      content: 'Analyze this dataset and provide insights on trends...',
      author: {
        name: 'Mike Rodriguez',
        username: '@mikedata'
      },
      model: 'GPT-4',
      purpose: 'Data Analysis',
      likesCount: 76,
      bookmarksCount: 45,
      createdAt: new Date('2024-01-13')
    }
  }
]

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('posts')
  const [userPosts, setUserPosts] = useState(mockUserPosts)
  const [bookmarks] = useState(mockBookmarks)

  if (!isLoaded) {
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
                  <p className="text-2xl font-bold">{userPosts.length}</p>
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
                  <p className="text-2xl font-bold">
                    {userPosts.reduce((sum, post) => sum + post.likesCount, 0)}
                  </p>
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
                  <p className="text-2xl font-bold">{bookmarks.length}</p>
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
                  <p className="text-2xl font-bold">
                    {userPosts.reduce((sum, post) => sum + post.viewsCount, 0)}
                  </p>
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
                        {post.createdAt.toLocaleDateString()}
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
                          by {bookmark.post.author.name} ({bookmark.post.author.username})
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
                        {bookmark.post.createdAt.toLocaleDateString()}
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
