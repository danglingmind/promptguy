// Mock database client for testing without a real database
export const mockPrisma = {
  user: {
    findUnique: async (params: any) => {
      // Return mock user data
      return {
        id: 'mock-user-id',
        clerkId: 'mock-clerk-id',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        imageUrl: null,
        bio: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    create: async (params: any) => {
      return {
        id: 'mock-user-id',
        ...params.data
      }
    }
  },
  post: {
    findMany: async (params: any) => {
      return []
    },
    create: async (params: any) => {
      return {
        id: 'mock-post-id',
        ...params.data
      }
    },
    findUnique: async (params: any) => null,
    update: async (params: any) => ({ id: 'mock-post-id' }),
    delete: async (params: any) => ({ id: 'mock-post-id' })
  },
  like: {
    findUnique: async (params: any) => null,
    create: async (params: any) => ({ id: 'mock-like-id' }),
    delete: async (params: any) => ({ id: 'mock-like-id' })
  },
  bookmark: {
    findUnique: async (params: any) => null,
    create: async (params: any) => ({ id: 'mock-bookmark-id' }),
    delete: async (params: any) => ({ id: 'mock-bookmark-id' })
  },
  share: {
    create: async (params: any) => ({ id: 'mock-share-id' })
  },
  follow: {
    findUnique: async (params: any) => null,
    create: async (params: any) => ({ id: 'mock-follow-id' }),
    delete: async (params: any) => ({ id: 'mock-follow-id' })
  },
  notification: {
    findMany: async (params: any) => [],
    create: async (params: any) => ({ id: 'mock-notification-id' }),
    updateMany: async (params: any) => ({ count: 0 }),
    count: async (params: any) => 0
  }
}
