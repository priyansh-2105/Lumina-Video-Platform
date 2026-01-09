"use client"

import { useState, useEffect } from "react"
import { VideoCard } from "@/components/video-card"
import { VideoCardSkeleton } from "@/components/video-card-skeleton"
import { CategoryFilter } from "@/components/category-filter"
import { videoService } from "@/services/api"
import type { Video } from "@/types"

interface HomeClientProps {
  initialVideos: Video[]
  initialCategory: string
}

export function HomeClient({ initialVideos, initialCategory }: HomeClientProps) {
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)

  useEffect(() => {
    async function fetchVideos() {
      setIsLoading(true)
      try {
        const data = await videoService.getVideos({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        })
        setVideos(data)
      } catch (error) {
        console.error("Failed to fetch videos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    // Only fetch if category changed from initial
    if (selectedCategory !== initialCategory) {
      fetchVideos()
    }
  }, [selectedCategory, initialCategory])

  return (
    <>
      {/* Category Filter */}
      <div className="mb-6">
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)
          : videos.map((video) => (
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

      {/* Empty State */}
      {!isLoading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-6xl">📹</div>
          <h2 className="text-xl font-semibold">No videos found</h2>
          <p className="mt-2 text-muted-foreground">Try selecting a different category</p>
        </div>
      )}
    </>
  )
}
