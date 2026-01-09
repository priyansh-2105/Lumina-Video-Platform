"use client"

import type React from "react"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { commentService } from "@/services/api"
import type { Comment } from "@/types"

interface CommentInputProps {
  videoId: string
  onCommentAdded: (comment: Comment) => void
}

export function CommentInput({ videoId, onCommentAdded }: CommentInputProps) {
  const { user, isAuthenticated } = useAuth()
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || !user) return

    setIsSubmitting(true)
    try {
      const comment = await commentService.addComment(videoId, content.trim())
      onCommentAdded(comment)
      setContent("")
      setIsFocused(false)
    } catch (error) {
      console.error("Failed to add comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-secondary p-4 text-center">
        <p className="text-sm text-muted-foreground">Please sign in to leave a comment</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
        <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="min-h-[40px] resize-none bg-transparent border-0 border-b border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
          rows={1}
        />
        {isFocused && (
          <div className="mt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setContent("")
                setIsFocused(false)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={!content.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Comment"
              )}
            </Button>
          </div>
        )}
      </div>
    </form>
  )
}
