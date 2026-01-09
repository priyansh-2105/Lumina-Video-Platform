"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Play, Trash2, LogOut, Clock, User } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/contexts/auth-context"
import { historyService } from "@/services/api"
import { formatDuration, formatDistanceToNow } from "@/utils/format"
import type { WatchHistoryItem } from "@/types"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [showClearDialog, setShowClearDialog] = useState(false)

  useEffect(() => {
    if (!user) return

    const userId = user.id

    let isMounted = true

    async function load() {
      try {
        const watchHistory = await historyService.getHistory(userId)
        if (isMounted) setHistory(watchHistory)
      } catch (e) {
        if (e instanceof Error && e.message === "Unauthorized") return
        console.error("Failed to load watch history", e)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [user?.id])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleClearHistory = async () => {
    if (!user) return

    try {
      await historyService.clearHistory(user.id)
      setHistory([])
    } catch (e) {
      if (e instanceof Error && e.message === "Unauthorized") return
      console.error("Failed to clear watch history", e)
    } finally {
      setShowClearDialog(false)
    }
  }

  const getProgressPercentage = (item: WatchHistoryItem) => {
    if (!item.video.duration) return 0
    return Math.min((item.progress / item.video.duration) * 100, 100)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Profile Section */}
          <Card className="mb-8 bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                  <AvatarFallback className="text-2xl">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left flex-1">
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  <p className="text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary capitalize">
                      <User className="mr-1 h-3 w-3" />
                      {user?.role}
                    </span>
                    {user?.createdAt && (
                      <span className="text-sm text-muted-foreground">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {user?.role === "creator" && (
                    <Button variant="outline" asChild>
                      <Link href="/creator?tab=upload">
                        Upload Video
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Watch History Section */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Watch History
              </CardTitle>
              {history.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => setShowClearDialog(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear History
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 text-6xl">📺</div>
                  <h2 className="text-xl font-semibold">No watch history</h2>
                  <p className="mt-2 text-muted-foreground">Videos you watch will appear here</p>
                  <Button className="mt-4" asChild>
                    <Link href="/">Browse Videos</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id || `${item.videoId}-${item.watchedAt}`} className="flex gap-4 rounded-lg border border-border bg-secondary/50 p-3">
                      <Link href={`/video/${item.videoId}`} className="flex-shrink-0">
                        <div className="relative h-24 w-40 overflow-hidden rounded-lg bg-secondary">
                          <Image
                            src={item.video.thumbnail || "/placeholder.svg"}
                            alt={item.video.title}
                            fill
                            className="object-cover"
                          />
                          {/* Progress bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/50">
                            <div className="h-full bg-primary" style={{ width: `${getProgressPercentage(item)}%` }} />
                          </div>
                        </div>
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/video/${item.videoId}`}>
                          <h3 className="font-medium leading-tight line-clamp-2 hover:text-primary transition-colors">
                            {item.video.title}
                          </h3>
                        </Link>
                        <Link
                          href={`/channel/${item.video.creatorId}`}
                          className="mt-1 block text-sm text-muted-foreground hover:text-foreground"
                        >
                          {item.video.creatorName}
                        </Link>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Watched {formatDistanceToNow(item.watchedAt)}</span>
                          <span>
                            {formatDuration(Math.floor(item.progress))} / {formatDuration(item.video.duration)}
                          </span>
                        </div>
                      </div>

                      <Button variant="outline" size="sm" asChild className="flex-shrink-0 self-center bg-transparent">
                        <Link href={`/video/${item.videoId}`}>
                          <Play className="mr-2 h-4 w-4" />
                          Resume
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Clear History Dialog */}
        <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear Watch History</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to clear your entire watch history? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearHistory}>Clear History</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  )
}
