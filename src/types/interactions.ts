export interface ToggleLikeRequestBody {
  postId: string
}

export interface ToggleLikeResponse {
  liked: boolean
}

export interface ToggleBookmarkRequestBody {
  postId: string
}

export interface ToggleBookmarkResponse {
  bookmarked: boolean
}

export interface ToggleFollowRequestBody {
  targetUserId: string
}

export interface ToggleFollowResponse {
  following: boolean
}

export interface ViewPostRequestBody {
  postId: string
}

export interface ViewPostResponse {
  viewsCount: number
}

