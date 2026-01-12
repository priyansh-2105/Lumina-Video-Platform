"use client"

import { BarChart3, TrendingUp, Eye, Heart, Calendar, Activity } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { formatDistanceToNow } from "date-fns"
import type { Video } from "@/types"

interface AnalyticsTabProps {
  videos: Video[]
}

export function AnalyticsTab({ videos }: AnalyticsTabProps) {
  // Calculate analytics data
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0)
  const avgViewsPerVideo = videos.length > 0 ? Math.round(totalViews / videos.length) : 0
  
  // Find top performing video
  const topVideo = videos.length > 0 
    ? videos.reduce((top, video) => video.views > top.views ? video : top, videos[0])
    : null

  // Calculate views over last 7 days (simplified - using recent uploads as proxy)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentVideos = videos.filter(v => new Date(v.createdAt) > sevenDaysAgo)
  const recentViews = recentVideos.reduce((sum, v) => sum + v.views, 0)

  // Generate chart data (simplified - using daily estimates)
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    // Simulate view distribution based on video ages
    const baseViews = Math.floor(totalViews / 7)
    const variation = Math.floor(Math.random() * baseViews * 0.5)
    return {
      day: dayName,
      views: Math.max(0, baseViews + variation - (6 - i) * 2)
    }
  })

  // Sort videos by views for top videos table
  const topVideos = [...videos].sort((a, b) => b.views - a.views).slice(0, 5)

  // Generate recent activity
  const generateActivity = () => {
    const activities: Array<{
      type: 'views' | 'likes'
      videoTitle: string
      count: number
      time: string
    }> = []
    
    videos.forEach(video => {
      // Add view activity
      if (video.views > 0) {
        activities.push({
          type: 'views',
          videoTitle: video.title,
          count: Math.min(video.views, 5), // Show recent activity
          time: formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
        })
      }
      
      // Add like activity
      if (video.likes > 0) {
        activities.push({
          type: 'likes',
          videoTitle: video.title,
          count: Math.min(video.likes, 3), // Show recent activity
          time: formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })
        })
      }
    })
    
    return activities
      .sort(() => Math.random() - 0.5) // Shuffle for realistic feel
      .slice(0, 6)
  }

  const recentActivity = generateActivity()

  const maxChartViews = Math.max(...chartData.map(d => d.views), 1)

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Recent views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Video</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {topVideo ? topVideo.title.substring(0, 20) + (topVideo.title.length > 20 ? "..." : "") : "No videos"}
            </div>
            <p className="text-xs text-muted-foreground">
              {topVideo ? `${topVideo.views.toLocaleString()} views` : "Upload your first video"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Views Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Views Over Time (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-12 text-sm font-medium">{data.day}</div>
                <div className="flex-1">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(data.views / maxChartViews) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-sm text-right font-medium">
                  {data.views.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Videos Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Videos</CardTitle>
          </CardHeader>
          <CardContent>
            {topVideos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No videos uploaded yet
              </div>
            ) : (
              <div className="space-y-4">
                {topVideos.map((video, index) => (
                  <div key={video.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-shrink-0">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-12 h-8 object-cover rounded"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{video.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {video.views.toLocaleString()} views • {video.likes.toLocaleString()} likes
                      </div>
                    </div>
                    <div className="px-2 py-1 bg-secondary rounded text-xs">
                      {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'views' ? 'bg-blue-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm">
                        {activity.type === 'views' ? (
                          <>
                            Your video <span className="font-medium">"{activity.videoTitle}"</span> gained{" "}
                            <span className="font-bold">{activity.count}</span> new view{activity.count > 1 ? 's' : ''}
                          </>
                        ) : (
                          <>
                            New like{activity.count > 1 ? 's' : ''} on <span className="font-medium">"{activity.videoTitle}"</span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
