export type UserRole = "viewer" | "creator"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  description?: string
  createdAt: string
}

export interface Video {
  id: string
  title: string
  description: string
  category: string
  thumbnail: string
  videoUrl: string
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  views: number
  likes: number
  dislikes: number
  duration: number
  createdAt: string
}

export interface Comment {
  id: string
  videoId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
}

export interface WatchHistoryItem {
  id: string
  videoId: string
  video: Video
  progress: number
  watchedAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
