"use client"

import { useState, useEffect, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { EditPostModal } from '@/components/EditPostModal'
import { toast } from 'sonner'
import { Heart, Bookmark, Share2, Eye, Edit3, User, Settings, Trash2, AlertTriangle } from 'lucide-react'
import type { PostResponse } from '@/types/post'
import Image from 'next/image'

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('posts')
  const [posts, setPosts] = useState<PostResponse[]>([])
  const [bookmarks, setBookmarks] = useState<Array<{
    id: string
    post: {
      id: string
      title: string
      content: string
      model: string
      purpose: string
      tags: string[]
      likesCount: number
      bookmarksCount: number
      sharesCount: number
      viewsCount: number
      isLikedByCurrentUser?: boolean
      isBookmarkedByCurrentUser?: boolean
    }
  }>>([])
  const [loading, setLoading] = useState(true)
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
  const [postToEdit, setPostToEdit] = useState<PostResponse | null>(null)
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [postToDelete, setPostToDelete] = useState<PostResponse | null>(null)
  
  // User profile state
  const [userProfile, setUserProfile] = useState<{
    id: string
    username: string
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
    email: string
  } | null>(null)
  
  // Username editor state
  const [currentUsername, setCurrentUsername] = useState<string>('')
  const [username, setUsername] = useState<string>('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const [checking, setChecking] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)
  const [editingUsername, setEditingUsername] = useState<boolean>(false)

  const isBasicValid = useMemo(() => {
    const t = username.trim()
    return t.length >= 5 && /^[a-zA-Z0-9]+$/.test(t)
  }, [username])

  useEffect(() => {
    // Only validate if user is actively editing and has typed something
    if (!editingUsername || !username.trim() || !isBasicValid) { 
      setAvailable(null)
      return 
    }
    
    const controller = new AbortController()
    const id = setTimeout(async () => {
      try {
        setChecking(true)
        const res = await fetch(`/api/user/username/availability?u=${encodeURIComponent(username)}`, { signal: controller.signal })
        if (!res.ok) return
        const data = await res.json() as { available: boolean }
        setAvailable(Boolean(data.available))
      } catch {
        // ignore
      } finally {
        setChecking(false)
      }
    }, 500) // Increased debounce time for better UX
    return () => { clearTimeout(id); controller.abort() }
  }, [username, isBasicValid, editingUsername])

  // Load user data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const [postsRes, bookmarksRes, userRes, profileRes] = await Promise.all([
          fetch('/api/posts?userOnly=true'),
          fetch('/api/user/bookmarks'),
          fetch('/api/user/username/check'),
          fetch('/api/user/profile')
        ])
        
        if (postsRes.ok) {
          const postsData = await postsRes.json()
          setPosts(postsData.posts || [])
        }
        
        if (bookmarksRes.ok) {
          const bookmarksData = await bookmarksRes.json()
          setBookmarks(bookmarksData.bookmarks || [])
        }

        if (userRes.ok) {
          const userData = await userRes.json()
          setCurrentUsername(userData.username || '')
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setUserProfile(profileData)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Refetch data when window gains focus or becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadData()
      }
    }

    const handleFocus = () => {
      loadData()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  async function handleSaveUsername() {
    if (!isBasicValid || available === false) return
    try {
      setSaving(true)
      const res = await fetch('/api/user/username', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Failed to update username')
        return
      }
      toast.success('Username updated')
      setCurrentUsername(username)
      setEditingUsername(false)
      setUsername('')
      
      // Refresh user profile to get updated data
      const profileRes = await fetch('/api/user/profile')
      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUserProfile(profileData)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleEditUsername() {
    setEditingUsername(true)
    setUsername('') // Start with empty field
    setAvailable(null) // Reset validation state
  }

  function handleCancelEdit() {
    setEditingUsername(false)
    setUsername('')
    setAvailable(null)
  }

  const handleEditPost = (post: PostResponse) => {
    setPostToEdit(post)
    setEditModalOpen(true)
  }

  const handleEditSuccess = (updatedPost: PostResponse) => {
    setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post))
    setEditModalOpen(false)
    setPostToEdit(null)
    toast.success('Post updated successfully')
  }

  const handleEditClose = () => {
    setEditModalOpen(false)
    setPostToEdit(null)
  }

  const handleDeleteClick = (post: PostResponse) => {
    setPostToDelete(post)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return

    try {
      const response = await fetch(`/api/posts/${postToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || 'Failed to delete post')
        return
      }

      // Remove the post from the local state
      setPosts(posts.filter(post => post.id !== postToDelete.id))
      toast.success('Post deleted successfully')
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Failed to delete post')
    }
  }

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false)
    setPostToDelete(null)
  }

  const handleLike = async (postId: string) => {
    try {
      const response = await fetch('/api/interactions/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Update posts list
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likesCount: data.liked ? post.likesCount + 1 : post.likesCount - 1,
                isLikedByCurrentUser: data.liked
              } 
            : post
        ))
        // Update bookmarks list
        setBookmarks(prev => prev.map(bookmark => 
          bookmark.post.id === postId 
            ? { 
                ...bookmark, 
                post: {
                  ...bookmark.post,
                  likesCount: data.liked ? bookmark.post.likesCount + 1 : bookmark.post.likesCount - 1,
                  isLikedByCurrentUser: data.liked
                }
              } 
            : bookmark
        ))
      } else {
        const errorData = await response.json()
        if (response.status === 401) {
          toast.info(errorData.error || 'Please sign in to like posts')
        } else {
          toast.error('Failed to like post')
        }
      }
    } catch (err) {
      console.error('Error liking post:', err)
      toast.error('Failed to like post')
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
        // Update posts list
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                bookmarksCount: data.bookmarked ? post.bookmarksCount + 1 : post.bookmarksCount - 1,
                isBookmarkedByCurrentUser: data.bookmarked
              } 
            : post
        ))
        // If unbookmarked, remove from bookmarks list
        if (!data.bookmarked) {
          setBookmarks(prev => prev.filter(bookmark => bookmark.post.id !== postId))
        } else {
          // Update bookmarks list
          setBookmarks(prev => prev.map(bookmark => 
            bookmark.post.id === postId 
              ? { 
                  ...bookmark, 
                  post: {
                    ...bookmark.post,
                    bookmarksCount: bookmark.post.bookmarksCount + 1,
                    isBookmarkedByCurrentUser: data.bookmarked
                  }
                } 
              : bookmark
          ))
        }
      } else {
        const errorData = await response.json()
        if (response.status === 401) {
          toast.info(errorData.error || 'Please sign in to bookmark posts')
        } else {
          toast.error('Failed to bookmark post')
        }
      }
    } catch (err) {
      console.error('Error bookmarking post:', err)
      toast.error('Failed to bookmark post')
    }
  }

  const handleShare = async (postId: string) => {
    try {
      const url = `${window.location.origin}/posts/${postId}`
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (err) {
      console.error('Error sharing post:', err)
      toast.error('Failed to copy link')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-lg text-muted-foreground mt-2">Manage your posts, bookmarks, and settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              My Posts
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Your Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading posts...</p>
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Edit3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">Create your first prompt to get started!</p>
                    <Button onClick={() => window.location.href = '/create-post'}>
                      Create Post
              </Button>
            </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map((post: PostResponse) => (
                      <Card key={post.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-3 break-words">{post.title}</h3>
                            <pre className="text-sm md:text-[15px] leading-6 text-muted-foreground mb-4 whitespace-pre-wrap break-words max-h-24 md:max-h-32 overflow-hidden [mask-image:linear-gradient(180deg,black_70%,transparent)]">
                          {post.content}
                            </pre>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
                                {post.model}
                              </Badge>
                              <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                                {post.purpose}
                              </Badge>
                              {post.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                              ))}
                      </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleLike(post.id)
                                  }}
                                  className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Like this post"
                                >
                                  <Heart className={`h-4 w-4 ${post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''}`} />
                                  <span>{post.likesCount}</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookmark(post.id)
                                  }}
                                  className="flex items-center gap-1 hover:text-yellow-500 transition-colors cursor-pointer"
                                  title="Bookmark this post"
                                >
                                  <Bookmark className={`h-4 w-4 ${post.isBookmarkedByCurrentUser ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                  <span>{post.bookmarksCount}</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShare(post.id)
                                  }}
                                  className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer"
                                  title="Share this post"
                                >
                                  <Share2 className="h-4 w-4" />
                                  <span>Share</span>
                                </button>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                <span>{post.viewsCount}</span>
                              </div>
                            </div>
                      </div>
                          <div className="flex items-center gap-1 ml-4">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditPost(post)}
                              className="h-8 w-8 p-0 hover:bg-muted"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(post)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                    </div>
                </Card>
              ))}
            </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookmarks" className="mt-6">
            <Card>
                  <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Bookmarked Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading bookmarks...</p>
                  </div>
                ) : bookmarks.length === 0 ? (
                  <div className="text-center py-12">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                    <p className="text-muted-foreground">Start bookmarking posts you like!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {bookmarks.map((bookmark) => (
                      <Card key={bookmark.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                            <h3 className="font-semibold text-xl mb-3 break-words">{bookmark.post.title}</h3>
                            <pre className="text-sm md:text-[15px] leading-6 text-muted-foreground mb-4 whitespace-pre-wrap break-words max-h-24 md:max-h-32 overflow-hidden [mask-image:linear-gradient(180deg,black_70%,transparent)]">
                          {bookmark.post.content}
                            </pre>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <Badge variant="default" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium">
                                {bookmark.post.model}
                              </Badge>
                              <Badge variant="outline" className="border-green-200 text-green-700 dark:border-green-800 dark:text-green-300">
                                {bookmark.post.purpose}
                              </Badge>
                              {bookmark.post.tags.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                              ))}
                      </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleLike(bookmark.post.id)
                                  }}
                                  className="flex items-center gap-1 hover:text-red-500 transition-colors cursor-pointer"
                                  title="Like this post"
                                >
                                  <Heart className={`h-4 w-4 ${bookmark.post.isLikedByCurrentUser ? 'fill-red-500 text-red-500' : ''}`} />
                                  <span>{bookmark.post.likesCount}</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBookmark(bookmark.post.id)
                                  }}
                                  className="flex items-center gap-1 hover:text-yellow-500 transition-colors cursor-pointer"
                                  title="Bookmark this post"
                                >
                                  <Bookmark className={`h-4 w-4 ${bookmark.post.isBookmarkedByCurrentUser ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                                  <span>{bookmark.post.bookmarksCount}</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleShare(bookmark.post.id)
                                  }}
                                  className="flex items-center gap-1 hover:text-blue-500 transition-colors cursor-pointer"
                                  title="Share this post"
                                >
                                  <Share2 className="h-4 w-4" />
                                  <span>Share</span>
                                </button>
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Eye className="h-4 w-4" />
                                <span>{bookmark.post.viewsCount}</span>
                              </div>
                            </div>
                      </div>
                    </div>
                </Card>
              ))}
            </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid gap-6">
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Settings
                  </CardTitle>
              </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Full Name Display */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Full Name</label>
                        <div className="flex items-center gap-3 mt-2">
                          {userProfile?.imageUrl ? (
                            <Image
                              src={userProfile.imageUrl}
                              alt={userProfile.firstName || userProfile.username}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary/15 flex items-center justify-center">
                              <span className="text-primary font-semibold text-lg">
                                {userProfile?.firstName?.charAt(0) || userProfile?.username?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="p-3 bg-muted rounded-md">
                              <span className="font-medium">
                                {userProfile?.firstName && userProfile?.lastName 
                                  ? `${userProfile.firstName} ${userProfile.lastName}`
                                  : userProfile?.firstName || 'Name not set'
                                }
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              This is managed by your account provider
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Username Settings */}
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Username</label>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1 p-3 bg-muted rounded-md">
                            <span className="font-mono">{currentUsername || 'Not set'}</span>
                          </div>
                          {!editingUsername && (
                            <Button variant="outline" onClick={handleEditUsername}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>

                      {editingUsername && (
                        <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div>
                            <label className="text-sm font-medium">New Username</label>
                            <Input 
                              value={username} 
                              onChange={e => setUsername(e.target.value)} 
                              placeholder="Enter new username (min 5 characters, alphanumeric only)" 
                              className="mt-2"
                              autoFocus
                            />
                            <div className="text-sm mt-2 space-y-1">
                              {checking && <span className="text-muted-foreground">Checking availability…</span>}
                              {!checking && available === true && <span className="text-green-600">✓ Available</span>}
                              {!checking && available === false && <span className="text-red-600">✗ Not available</span>}
                              {!isBasicValid && username.trim() && <span className="text-amber-600">Username must be 5+ characters, alphanumeric only</span>}
                            </div>
                </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleSaveUsername} 
                              disabled={!isBasicValid || available === false || saving || !username.trim()}
                              size="sm"
                            >
                              {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={handleCancelEdit}
                              size="sm"
                            >
                              Cancel
                </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>

        </Tabs>

        {/* Edit Post Modal */}
        {postToEdit && (
          <EditPostModal
            post={postToEdit}
            isOpen={editModalOpen}
            onClose={handleEditClose}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Post
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &ldquo;{postToDelete?.title}&rdquo;? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteConfirm}
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
