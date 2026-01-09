import { HomeClient } from "./home-client"
import { Navbar } from "@/components/navbar"

export const dynamic = "force-dynamic"

async function getVideos() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000"
  const res = await fetch(`${baseUrl}/api/videos`, { cache: "no-store" })
  if (!res.ok) {
    console.error("Failed to fetch videos:", res.status, res.statusText)
    return []
  }
  return res.json()
}

export default async function HomePage() {
  // Fetch initial videos on server
  const videos = await getVideos()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <HomeClient initialVideos={videos} initialCategory="all" />
      </main>
    </div>
  )
}
