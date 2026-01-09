import { Suspense } from "react"
import { VideoClient } from "./video-client"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"

interface VideoPageProps {
  params: Promise<{ id: string }>
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"

async function getVideo(id: string) {
  const res = await fetch(`${baseUrl}/api/videos/${encodeURIComponent(id)}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

async function getVideos() {
  const res = await fetch(`${baseUrl}/api/videos`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

async function getComments(videoId: string) {
  const res = await fetch(`${baseUrl}/api/videos/${encodeURIComponent(videoId)}/comments`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params

  try {
    // Fetch data on server side
    const [videoData, allVideos, commentsData] = await Promise.all([
      getVideo(id),
      getVideos(),
      getComments(id),
    ])

    if (!videoData) {
      notFound()
    }

    const relatedVideos = allVideos.filter((v: any) => v.id !== videoData.id).slice(0, 6)

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          <VideoClient 
            video={videoData} 
            relatedVideos={relatedVideos} 
            comments={commentsData} 
          />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch video:", error)
    notFound()
  }
}
