"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CreatorDashboardClient } from "./creator-dashboard-client"
import { getCreatorVideos } from "@/services/video-service"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import type { Video } from "@/types"

function SearchParamsWrapper({ children }: { children: (tab: string) => React.JSX.Element }) {
  const searchParams = useSearchParams()
  const tab = searchParams.get("tab") || "videos"
  return children(tab)
}

function CreatorPageContent() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [initialVideos, setInitialVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/profile")
      return
    }

    if (user.role !== "creator") {
      router.replace("/profile")
      return
    }

    const fetchVideos = async () => {
      try {
        const videos = await getCreatorVideos(user.id)
        setInitialVideos(videos)
      } catch (error) {
        console.error("Failed to fetch creator videos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [user, isAuthenticated, router])

  if (loading || !user) {
    return <div>Loading...</div>
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsWrapper>
        {(tab) => <CreatorDashboardClient initialVideos={initialVideos} activeTab={tab} />}
      </SearchParamsWrapper>
    </Suspense>
  )
}

export default function CreatorPage() {
  return <CreatorPageContent />
}

export const dynamic = 'force-dynamic'
