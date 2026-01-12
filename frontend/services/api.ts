import type { Comment, User, UserRole, Video, WatchHistoryItem } from "@/types"

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000/api"

function clearStoredAuth() {
  if (typeof window === "undefined") return
  localStorage.removeItem("lumina_token")
  localStorage.removeItem("lumina_user")
}

function notifyUnauthorized() {
  if (typeof window === "undefined") return
  try {
    window.dispatchEvent(new Event("lumina:unauthorized"))
  } catch {
    // ignore
  }
}

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("lumina_token")
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  opts?: { auth?: boolean },
): Promise<T> {
  const url = `${API_BASE}${path}`
  const headers = new Headers(init?.headers)

  const token = getStoredToken()
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  if (opts?.auth && !token) {
    clearStoredAuth()
    notifyUnauthorized()
    throw new Error("Unauthorized")
  }

  const res = await fetch(url, {
    ...init,
    headers,
  })

  if (res.status === 401) {
    clearStoredAuth()
    notifyUnauthorized()
    throw new Error("Unauthorized")
  }

  if (res.status === 403) {
    // 403 means user is authenticated but forbidden - don't clear auth data
    throw new Error("Forbidden")
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      message = data?.message || message
    } catch {
      // ignore
    }
    throw new Error(message)
  }

  return (await res.json()) as T
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return apiFetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
  },

  async register(name: string, email: string, password: string, role: UserRole): Promise<{ token: string; user: User }> {
    return apiFetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password, role }),
    })
  },
}

export const metaService = {
  async getCategories(): Promise<string[]> {
    return apiFetch("/categories")
  },
}

export const videoService = {
  async getVideos(params?: { search?: string; category?: string }): Promise<Video[]> {
    const qs = new URLSearchParams()
    if (params?.search) qs.set("search", params.search)
    if (params?.category) qs.set("category", params.category)
    const query = qs.toString() ? `?${qs.toString()}` : ""
    return apiFetch(`/videos${query}`)
  },

  async getVideoById(id: string): Promise<Video | null> {
    try {
      return await apiFetch(`/videos/${encodeURIComponent(id)}`)
    } catch (e) {
      if (e instanceof Error && e.message.toLowerCase().includes("not found")) return null
      throw e
    }
  },

  async likeVideo(id: string): Promise<{ likes: number; dislikes: number; action: "like" | "dislike" | null }> {
    return apiFetch(`/videos/${encodeURIComponent(id)}/like`, { method: "POST" }, { auth: true })
  },

  async dislikeVideo(id: string): Promise<{ likes: number; dislikes: number; action: "like" | "dislike" | null }> {
    return apiFetch(`/videos/${encodeURIComponent(id)}/dislike`, { method: "POST" }, { auth: true })
  },

  async incrementViews(id: string): Promise<{ views: number }> {
    return apiFetch(`/videos/${encodeURIComponent(id)}/view`, { method: "POST" })
  },

  async uploadVideo(data: FormData): Promise<Video> {
    // Do NOT set Content-Type header when sending FormData; fetch sets it with boundary
    return apiFetch(`/videos/upload`, { method: "POST", body: data }, { auth: true })
  },

  async deleteVideo(id: string): Promise<void> {
    await apiFetch(`/videos/${encodeURIComponent(id)}`, { method: "DELETE" }, { auth: true })
  },
}

export const commentService = {
  async getComments(videoId: string): Promise<Comment[]> {
    return apiFetch(`/videos/${encodeURIComponent(videoId)}/comments`)
  },

  async addComment(videoId: string, content: string): Promise<Comment> {
    return apiFetch(
      `/videos/${encodeURIComponent(videoId)}/comment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      },
      { auth: true },
    )
  },
}

export const historyService = {
  async getHistory(): Promise<WatchHistoryItem[]> {
    return apiFetch(`/users/history/me`, undefined, { auth: true })
  },

  async clearHistory(): Promise<void> {
    return apiFetch(`/users/history/me`, { method: "DELETE" }, { auth: true })
  },

  async saveProgress(videoId: string, progress: number): Promise<WatchHistoryItem> {
    return apiFetch(
      `/videos/${encodeURIComponent(videoId)}/progress`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ progress }),
      },
      { auth: true },
    )
  },
}

export const creatorService = {
  async getCreator(
    creatorId: string,
  ): Promise<{ id: string; name: string; avatar: string; description: string } | null> {
    try {
      return await apiFetch(`/users/${encodeURIComponent(creatorId)}`)
    } catch (e) {
      if (e instanceof Error && e.message.toLowerCase().includes("not found")) return null
      throw e
    }
  },
}

export const userService = {
  async subscribe(creatorId: string): Promise<{ success: boolean; subscribersCount: number; isSubscribed: boolean }> {
    return apiFetch(
      `/users/${encodeURIComponent(creatorId)}/subscribe`,
      { method: "POST" },
      { auth: true }
    )
  },

  async unsubscribe(creatorId: string): Promise<{ success: boolean; subscribersCount: number; isSubscribed: boolean }> {
    return apiFetch(
      `/users/${encodeURIComponent(creatorId)}/unsubscribe`,
      { method: "POST" },
      { auth: true }
    )
  },

  async getSubscriptions(): Promise<{ subscriptions: User[]; count: number }> {
    return apiFetch("/users/me/subscriptions", undefined, { auth: true })
  },

  async getSubscriptionsFeed(): Promise<Video[]> {
    return apiFetch("/videos/subscriptions-feed", undefined, { auth: true })
  },
}
