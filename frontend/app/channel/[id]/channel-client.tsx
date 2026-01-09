"use client"

import Image from "next/image"
import { VideoCard } from "@/components/video-card"
import { formatViews } from "@/utils/format"
import type { Video } from "@/types"

interface Creator {
  id: string
  name: string
  avatar: string
  description: string
}

interface ChannelClientProps {
  creator: Creator
  videos: Video[]
}

export function ChannelClient({ creator, videos }: ChannelClientProps) {
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)

  return (
    <>
      {/* Channel Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-6 rounded-xl bg-card p-6 border border-border">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-secondary flex-shrink-0">
          <Image
            src={creator.avatar || "/placeholder.svg"}
            alt={creator.name}
            width={96}
            height={96}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">{creator.name}</h1>
          <p className="mt-1 text-muted-foreground">{creator.description}</p>
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{videos.length}</strong> videos
            </span>
            <span>
              <strong className="text-foreground">{formatViews(totalViews)}</strong> total views
            </span>
          </div>
        </div>
      </div>

      {/* Videos */}
      <h2 className="mb-4 text-xl font-semibold">Videos</h2>
      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-6xl">📹</div>
          <h2 className="text-xl font-semibold">No videos yet</h2>
          <p className="mt-2 text-muted-foreground">This channel hasn't uploaded any videos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard
              key={video.id}
              id={video.id}
              title={video.title}
              thumbnail={video.thumbnail}
              creatorId={video.creatorId}
              creatorName={video.creatorName}
              creatorAvatar={video.creatorAvatar}
              views={video.views}
              duration={video.duration}
              createdAt={video.createdAt}
            />
          ))}
        </div>
      )}
    </>
  )
}
