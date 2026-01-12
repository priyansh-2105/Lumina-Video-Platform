"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/utils/duration"
import { historyService } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"
import type { Video } from "@/types"

interface VideoPlayerProps {
  video: Video
  onFirstPlay?: () => void
}

export function VideoPlayer({ video, onFirstPlay }: VideoPlayerProps) {
  const { user, isAuthenticated } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hasStarted, setHasStarted] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Check if video URL is valid (not placeholder)
  const isValidVideoUrl = video.videoUrl && !video.videoUrl.includes('/placeholder.')

  // Load saved progress
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const userId = user.id

    let isMounted = true

    async function loadProgress() {
      try {
        const items = await historyService.getHistory()
        const match = items.find((h) => h.videoId === video.id)
        const savedProgress = match?.progress || 0

        if (isMounted && savedProgress > 0 && videoRef.current) {
          videoRef.current.currentTime = savedProgress
          setCurrentTime(savedProgress)
        }
      } catch (e) {
        if (e instanceof Error && e.message === "Unauthorized") return
        console.error("Failed to load saved progress", e)
      }
    }

    loadProgress()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user?.id, video.id])

  // Save progress periodically
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        historyService.saveProgress(video.id, videoRef.current.currentTime).catch((e) => {
          if (e instanceof Error && e.message === "Unauthorized") return
          console.error("Failed to save progress", e)
        })
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isAuthenticated, user?.id, video.id, isPlaying])

  // Handle controls visibility
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }, [isPlaying])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
        if (!hasStarted) {
          setHasStarted(true)
          onFirstPlay?.()
        }
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {!isValidVideoUrl || videoError ? (
        // Show placeholder when video URL is invalid or video fails to load
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
              <Play className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Video not available</p>
            <p className="text-sm text-muted-foreground mt-2">
              {video.title}
            </p>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={() => setVideoError(true)}
          onClick={handlePlayPause}
          crossOrigin="anonymous"
        />
      )}

      {/* Play button overlay - only show for valid videos */}
      {!isPlaying && isValidVideoUrl && !videoError && (
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
          aria-label="Play video"
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/90 transition-transform hover:scale-110">
            <Play className="h-10 w-10 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </button>
      )}

      {/* Controls - only show for valid videos */}
      {isValidVideoUrl && !videoError && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
        {/* Progress bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
          />
        </div>

        {/* Control buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-foreground/10"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-foreground hover:bg-foreground/10"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
              <div className="w-24 hidden sm:block">
                <Slider value={[isMuted ? 0 : volume]} min={0} max={1} step={0.01} onValueChange={handleVolumeChange} />
              </div>
            </div>

            <span className="text-sm text-foreground">
              {formatDuration(Math.floor(currentTime))} / {formatDuration(Math.floor(duration))}
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-foreground hover:bg-foreground/10"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
        </div>
      )}
    </div>
  )
}
