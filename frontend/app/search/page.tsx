import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { VideoCardSkeleton } from "@/components/video-card-skeleton"
import { SearchContent } from "@/components/search-content"

function SearchFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 h-10 w-full rounded-lg bg-secondary animate-pulse" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <VideoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Suspense fallback={<SearchFallback />}>
        <SearchContent />
      </Suspense>
    </div>
  )
}
