"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Video, Upload, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { videoService } from "@/services/api"
import { UploadForm } from "@/components/upload-form"
import type { Video as VideoType } from "@/types"

export default function CreatorPage() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeTab === "videos") {
      loadVideos()
    }
  }, [activeTab])

  const loadVideos = async () => {
    try {
      const allVideos = await videoService.getVideos()
      setVideos(allVideos.filter((v: VideoType) => v.creatorId === user?.id))
    } catch (err) {
      console.error("Failed to load creator videos", err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (video: VideoType) => {
    // Redirect to My Videos tab after successful upload
    router.push("/creator?tab=videos")
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videos.length}</div>
                <p className="text-xs text-muted-foreground">Uploaded videos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {videos.reduce((sum: number, v: VideoType) => sum + v.views, 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">All-time views</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Engagement</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {videos.length > 0
                    ? Math.round(
                        videos.reduce((sum: number, v: VideoType) => sum + v.likes + v.dislikes, 0) / videos.length
                      ).toLocaleString()
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">Avg likes + dislikes</p>
              </CardContent>
            </Card>
          </div>
        )

      case "videos":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">My Videos</h2>
              <Button asChild>
                <Link href="/creator?tab=upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New
                </Link>
              </Button>
            </div>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-video bg-muted rounded-t-lg" />
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                <p className="text-muted-foreground mb-4">Upload your first video to get started</p>
                <Button asChild>
                  <Link href="/creator?tab=upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Video
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {videos.map((video: VideoType) => (
                  <Card key={video.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg"}
                        alt={video.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium line-clamp-2 mb-2">{video.title}</h3>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{video.views.toLocaleString()} views</span>
                        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )

      case "upload":
        return (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold mb-6">Upload Video</h2>
            <UploadForm onUploadComplete={handleUploadComplete} />
          </div>
        )

      case "analytics":
        return (
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground">Analytics dashboard coming soon.</p>
          </div>
        )

      case "settings":
        return (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-muted-foreground">Creator settings coming soon.</p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {renderTabContent()}
    </div>
  )
}
