"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { Play } from "lucide-react"
import { formatDistanceToNow } from "@/utils/format"
import { formatDuration } from "@/utils/duration"
import type { Video } from "@/types"

interface VideoCardProps {
  id: string
  title: string
  thumbnail: string
  creatorId: string
  creatorName: string
  creatorAvatar?: string
  views: number
  duration: number
  createdAt: string
}

export function VideoCard({
  id,
  title,
  thumbnail,
  creatorId,
  creatorName,
  creatorAvatar,
  views,
  duration,
  createdAt
}: VideoCardProps): React.ReactElement {
  const formatViews = function(count: number) {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  return (
    <article className="group cursor-pointer">
      <Link href={`/video/${id}`}>
        <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden">
          {/* Thumbnail */}
          <Image
            src={thumbnail || "/placeholder.svg?height=180&width=320"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
          </div>
          {/* Duration badge - always show when duration exists */}
          {duration && duration > 0 && (
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
              {formatDuration(duration)}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex gap-3">
        <Link href={`/channel/${creatorId}`} className="flex-shrink-0">
          <div className="h-9 w-9 overflow-hidden rounded-full bg-secondary">
            {creatorAvatar ? (
              <Image
                src={creatorAvatar || "/placeholder.svg"}
                alt={creatorName}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                {creatorName.charAt(0)}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/video/${id}`}>
            <h3 className="font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
          <Link
            href={`/channel/${creatorId}`}
            className="mt-1 block text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {creatorName}
          </Link>
          <p className="text-sm text-muted-foreground">
            {formatViews(views)} views • {formatDistanceToNow(createdAt)}
          </p>
        </div>
      </div>
    </article>
  )
}
