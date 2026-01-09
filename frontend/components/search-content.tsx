"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SearchIcon, SlidersHorizontal } from "lucide-react"
import { VideoCard } from "@/components/video-card"
import { VideoCardSkeleton } from "@/components/video-card-skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { metaService, videoService } from "@/services/api"
import type { Video } from "@/types"

export function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""

  const [query, setQuery] = useState(initialQuery)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [categories, setCategories] = useState<string[]>(["All"])
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      try {
        const data = await metaService.getCategories()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data)
        }
      } catch (e) {
        console.error("Failed to load categories", e)
      }
    }

    loadCategories()
    return () => {
      isMounted = false
    }
  }, [])

  const performSearch = useCallback(async () => {
    setIsLoading(true)
    try {
      const results = await videoService.getVideos({
        search: query,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
      })
      setVideos(results)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [query, selectedCategory])

  useEffect(() => {
    performSearch()
  }, [performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?q=${encodeURIComponent(query)}`)
    performSearch()
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search videos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 bg-secondary border-0"
            />
          </div>
          <Button type="submit">Search</Button>
          <Button type="button" variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </form>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg bg-card p-4 border border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Category:</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-secondary border-0">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {initialQuery && (
        <p className="mb-4 text-muted-foreground">
          {isLoading
            ? "Searching..."
            : `${videos.length} result${videos.length !== 1 ? "s" : ""} for "${initialQuery}"`}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-6xl">🔍</div>
          <h2 className="text-xl font-semibold">No results found</h2>
          <p className="mt-2 text-muted-foreground">
            {initialQuery ? `No videos match "${initialQuery}"` : "Try searching for something"}
          </p>
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
    </main>
  )
}
