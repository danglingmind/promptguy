export interface CreatePostRequestBody {
  title: string
  content: string
  model: string
  purpose: string
  tags: string[]
  isPublic: boolean
}

export interface PostAuthorSummary {
  id: string
  username: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
}

export interface PostResponse {
  id: string
  title: string
  content: string
  model: string
  purpose: string
  tags: string[]
  isPublic: boolean
  likesCount: number
  bookmarksCount: number
  sharesCount: number
  viewsCount: number
  author: PostAuthorSummary
  createdAt: string
  updatedAt?: string
}

export interface ListPostsQuery {
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'likesCount' | 'bookmarksCount' | 'viewsCount'
  order?: 'asc' | 'desc'
  model?: string
  purpose?: string
  search?: string
}

export interface ListPostsResponse {
  posts: PostResponse[]
  hasMore?: boolean
}

