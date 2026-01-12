"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Video, Upload, BarChart3, Settings, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Suspense } from "react"

function CreatorLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  if (!user || user.role !== "creator") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-2">Creator Access Required</h2>
            <p className="text-muted-foreground mb-4">You need a creator account to access this page.</p>
            <Button asChild>
              <Link href="/profile">Go to Profile</Link>
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "videos", label: "My Videos", icon: Video },
    { id: "upload", label: "Upload Video", icon: Upload },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Creator Dashboard</h1>
              <Button variant="outline" asChild>
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading creator dashboard...</div>}>
      <CreatorLayoutContent>{children}</CreatorLayoutContent>
    </Suspense>
  )
}
