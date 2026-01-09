import { Suspense } from "react"
import { ChannelClient } from "./channel-client"
import { Navbar } from "@/components/navbar"
import { Loader2 } from "lucide-react"
import { notFound } from "next/navigation"

interface ChannelPageProps {
  params: Promise<{ id: string }>
}

interface Creator {
  id: string
  name: string
  avatar: string
  description: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"

async function getCreator(id: string) {
  const res = await fetch(`${baseUrl}/api/users/${encodeURIComponent(id)}`, { cache: "no-store" })
  if (!res.ok) return null
  return res.json()
}

async function getVideos() {
  const res = await fetch(`${baseUrl}/api/videos`, { cache: "no-store" })
  if (!res.ok) return []
  return res.json()
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { id } = await params

  try {
    const [creatorData, allVideos] = await Promise.all([
      getCreator(id),
      getVideos(),
    ])

    if (!creatorData) {
      notFound()
    }

    const creatorVideos = allVideos.filter((v: any) => v.creatorId === id)

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Suspense
            fallback={
              <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <ChannelClient creator={creatorData} videos={creatorVideos} />
          </Suspense>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Failed to fetch channel data:", error)
    notFound()
  }
}
