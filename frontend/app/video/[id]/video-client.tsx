"use client"

import { VideoPlayer } from "@/components/video-player"
import { LikeDislikeButton } from "@/components/like-dislike-button"
import { CommentInput } from "@/components/comment-input"
import { CommentList } from "@/components/comment-list"
import { SubscribeButton, SubscriberCount } from "@/components/subscribe-button"
import { videoService, userService, creatorService } from "@/services/api"
import { formatViews, formatDistanceToNow } from "@/utils/format"
import type { Video, Comment } from "@/types"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"

interface VideoClientProps {
  video: Video
  relatedVideos: Video[]
  comments: Comment[]
}

export function VideoClient({ video, relatedVideos, comments: initialComments }: VideoClientProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [views, setViews] = useState(video.views)
  const [creatorData, setCreatorData] = useState<{
    isSubscribed?: boolean
    subscribersCount?: number
  }>({})

  useEffect(() => {
    const loadCreatorData = async () => {
      try {
        const creator = await creatorService.getCreator(video.creatorId)
        if (creator) {
          setCreatorData({
            isSubscribed: (creator as any).isSubscribed || false,
            subscribersCount: (creator as any).subscribersCount || 0
          })
        }
      } catch (error) {
        console.error('Failed to load creator data:', error)
      }
    }

    loadCreatorData()
  }, [video.creatorId])

  const handleFirstPlay = async () => {
    try {
      const res = await videoService.incrementViews(video.id)
      if (typeof res?.views === "number") {
        setViews(res.views)
      }
    } catch (e) {
      console.error("Failed to increment views", e)
    }
  }

  const handleCommentAdded = (comment: Comment) => {
    setComments((prev) => [comment, ...prev])
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <VideoPlayer video={video} onFirstPlay={handleFirstPlay} />

          {/* Video Info */}
          <div className="mt-4">
            <h1 className="text-xl font-bold leading-tight sm:text-2xl text-balance">{video.title}</h1>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <Link href={`/channel/${video.creatorId}`} className="flex items-center gap-3 flex-1">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-secondary">
                    {video.creatorAvatar ? (
                      <Image
                        src={video.creatorAvatar || "/placeholder.svg"}
                        alt={video.creatorName}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                        {video.creatorName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium hover:text-primary transition-colors">{video.creatorName}</p>
                    <SubscriberCount count={creatorData.subscribersCount || 0} />
                  </div>
                </Link>
                <SubscribeButton
                  creatorId={video.creatorId}
                  initialSubscribed={creatorData.isSubscribed}
                  initialSubscribersCount={creatorData.subscribersCount}
                  size="sm"
                />
              </div>

              {/* Like/Dislike Buttons */}
              <LikeDislikeButton videoId={video.id} initialLikes={video.likes} initialDislikes={video.dislikes} />
            </div>

            {/* Description */}
            <div className="mt-4 rounded-lg bg-secondary p-4">
              <span className="inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary mb-2">
                {video.category}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">{video.description}</p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">{comments.length} Comments</h2>
            <div className="mb-6">
              <CommentInput videoId={video.id} onCommentAdded={handleCommentAdded} />
            </div>
            <CommentList comments={comments} />
          </div>
        </div>

        {/* Sidebar - Related Videos */}
        <aside className="lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">Related Videos</h2>
          <div className="space-y-4">
            {relatedVideos.map((relatedVideo) => (
              <div key={relatedVideo.id} className="flex gap-3">
                <Link href={`/video/${relatedVideo.id}`} className="flex-shrink-0">
                  <div className="relative h-24 w-40 overflow-hidden rounded-lg bg-secondary">
                    <Image
                      src={relatedVideo.thumbnail || "/placeholder.svg"}
                      alt={relatedVideo.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/video/${relatedVideo.id}`}>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                      {relatedVideo.title}
                    </h3>
                  </Link>
                  <Link
                    href={`/channel/${relatedVideo.creatorId}`}
                    className="mt-1 block text-xs text-muted-foreground hover:text-foreground"
                  >
                    {relatedVideo.creatorName}
                  </Link>
                  <p className="text-xs text-muted-foreground">{formatViews(relatedVideo.views)} views</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}
