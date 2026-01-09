"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { videoService } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"
import { formatViews } from "@/utils/format"

interface LikeDislikeButtonProps {
  videoId: string
  initialLikes: number
  initialDislikes: number
}

export function LikeDislikeButton({ videoId, initialLikes, initialDislikes }: LikeDislikeButtonProps) {
  const { isAuthenticated } = useAuth()
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [userAction, setUserAction] = useState<"like" | "dislike" | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLike = async () => {
    if (!isAuthenticated || isLoading) return

    setIsLoading(true)
    try {
      const res = await videoService.likeVideo(videoId)
      setLikes(res.likes)
      setDislikes(res.dislikes)
      setUserAction(res.action)
    } catch (error) {
      console.error("Failed to like video:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDislike = async () => {
    if (!isAuthenticated || isLoading) return

    setIsLoading(true)
    try {
      const res = await videoService.dislikeVideo(videoId)
      setLikes(res.likes)
      setDislikes(res.dislikes)
      setUserAction(res.action)
    } catch (error) {
      console.error("Failed to dislike video:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center rounded-full bg-secondary">
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-l-full rounded-r-none px-4 ${userAction === "like" ? "text-primary" : ""}`}
        onClick={handleLike}
        disabled={!isAuthenticated}
      >
        <ThumbsUp className={`mr-2 h-4 w-4 ${userAction === "like" ? "fill-current" : ""}`} />
        {formatViews(likes)}
      </Button>
      <div className="h-6 w-px bg-border" />
      <Button
        variant="ghost"
        size="sm"
        className={`rounded-r-full rounded-l-none px-4 ${userAction === "dislike" ? "text-primary" : ""}`}
        onClick={handleDislike}
        disabled={!isAuthenticated}
      >
        <ThumbsDown className={`mr-2 h-4 w-4 ${userAction === "dislike" ? "fill-current" : ""}`} />
        {formatViews(dislikes)}
      </Button>
    </div>
  )
}
