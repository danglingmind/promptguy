export interface AuthContext {
  clerkUserId: string
}

export interface ProvisionedUser {
  id: string
  clerkId: string
  email: string
  username: string
  firstName: string | null
  lastName: string | null
  imageUrl: string | null
}

export interface EnsureUserParams {
  clerkUserId: string
  email?: string
  username?: string
  firstName?: string | null
  lastName?: string | null
  imageUrl?: string | null
}

