"use client"

import { useState, useEffect } from "react"
import { Bell, Video, Users, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VideoCard } from "@/components/video-card"
import { Navbar } from "@/components/navbar"
import { ProtectedRoute } from "@/components/protected-route"
import { userService } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"
import type { Video as VideoType, User } from "@/types"

export default function SubscriptionsPage() {
  const { user, isAuthenticated } = useAuth()
  const [videos, setVideos] = useState<VideoType[]>([])
  const [subscriptions, setSubscriptions] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // First load subscriptions
        const subscriptionsData = await userService.getSubscriptions()
        setSubscriptions(subscriptionsData.subscriptions)

        // Only try to load videos if user has subscriptions
        if (subscriptionsData.subscriptions.length > 0) {
          try {
            const videosData = await userService.getSubscriptionsFeed()
            setVideos(videosData)
          } catch (videoErr) {
            console.warn('No videos from subscriptions:', videoErr)
            setVideos([]) // Set empty array if no videos found
          }
        } else {
          setVideos([])
        }
      } catch (err) {
        console.error('Failed to load subscriptions data:', err)
        // Don't set error for empty subscriptions or user not found - this is normal for new users
        if (err instanceof Error && (err.message.includes('404') || err.message.includes('User not found') || err.message.includes('Not found'))) {
          // Clear stale auth data if user not found in database
          if (err.message.includes('User not found')) {
            localStorage.removeItem('lumina_token')
            localStorage.removeItem('lumina_user')
            window.location.href = '/login'
            return
          }
          // Treat 404 as empty subscriptions, not an error
          setVideos([])
          setSubscriptions([])
        } else {
          setError('Failed to load subscriptions')
          setVideos([])
          setSubscriptions([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  if (!user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Subscriptions</h1>
          </div>
          <p className="text-muted-foreground">
            Latest videos from creators you're subscribed to
          </p>
        </div>

        {/* Subscriptions Summary */}
        {subscriptions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Subscriptions ({subscriptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {subscriptions.slice(0, 8).map((creator) => (
                  <div key={creator.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      {creator.avatar ? (
                        <img 
                          src={creator.avatar} 
                          alt={creator.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-sm font-medium">{creator.name}</span>
                  </div>
                ))}
                {subscriptions.length > 8 && (
                  <div className="text-sm text-muted-foreground">
                    +{subscriptions.length - 8} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
            <p>Loading your subscriptions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-destructive mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && subscriptions.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No subscriptions</h2>
            <p className="text-muted-foreground mb-6">
              {isAuthenticated 
                ? "You haven't subscribed to any creators yet. Discover videos and subscribe to see their latest content here."
                : "Sign in to subscribe to creators and see their latest videos in your personalized feed."
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.href = "/"}>
                {isAuthenticated ? "Discover Videos" : "Browse Content"}
              </Button>
              {!isAuthenticated && (
                <Button variant="outline" onClick={() => window.location.href = "/login"}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Videos Feed */}
        {!isLoading && !error && subscriptions.length > 0 && (
          <>
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No videos yet</h2>
                <p className="text-muted-foreground">
                  Your subscribed creators haven't uploaded any videos yet. Check back later!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Latest Videos</h2>
                  <div className="text-sm text-muted-foreground">
                    {videos.length} video{videos.length !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
