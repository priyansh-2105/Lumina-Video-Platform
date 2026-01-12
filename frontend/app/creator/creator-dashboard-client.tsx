"use client"

import { Video, Upload, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UploadForm } from "@/components/upload-form"
import { AnalyticsTab } from "@/components/analytics-tab"
import { SettingsTab } from "@/components/settings-tab"
import { useRouter } from "next/navigation"
import type { Video as VideoType } from "@/types"

interface CreatorDashboardClientProps {
  initialVideos: VideoType[]
  activeTab: string
}

export function CreatorDashboardClient({ initialVideos, activeTab }: CreatorDashboardClientProps) {
  const router = useRouter()

  const handleUploadComplete = (video: VideoType) => {
    // Navigate to My Videos tab to show the newly uploaded video
    router.push("/creator?tab=videos")
  }

  const handleTabChange = (value: string) => {
    router.push(`/creator?tab=${value}`)
  }
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="videos">My Videos</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="videos" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{initialVideos.length}</div>
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
                  {initialVideos.reduce((sum, v) => sum + v.views, 0).toLocaleString()}
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
                  {initialVideos.length > 0
                    ? Math.round(
                        initialVideos.reduce((sum, v) => sum + v.likes + v.dislikes, 0) / initialVideos.length
                      ).toLocaleString()
                    : "0"}
                </div>
                <p className="text-xs text-muted-foreground">Avg likes + dislikes</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Videos</h3>
            {initialVideos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No videos yet</h3>
                <p className="text-muted-foreground">Upload your first video to get started</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {initialVideos.map((video) => (
                  <Card key={video.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{video.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {video.views.toLocaleString()} views • {video.likes.toLocaleString()} likes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <UploadForm onUploadComplete={handleUploadComplete} />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab videos={initialVideos} />
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
