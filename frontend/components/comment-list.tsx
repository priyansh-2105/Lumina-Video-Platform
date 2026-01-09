"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDistanceToNow } from "@/utils/format"
import type { Comment } from "@/types"

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id || `${comment.userId}-${comment.createdAt}`} className="flex gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={comment.userAvatar || "/placeholder.svg"} alt={comment.userName} />
            <AvatarFallback>{comment.userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{comment.userName}</span>
              <span className="text-xs text-muted-foreground">{formatDistanceToNow(comment.createdAt)}</span>
            </div>
            <p className="mt-1 text-sm leading-relaxed">{comment.content}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
