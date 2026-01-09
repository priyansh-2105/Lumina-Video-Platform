"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Upload, X, FileVideo, ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { metaService, videoService } from "@/services/api"
import { useAuth } from "@/contexts/auth-context"
import type { Video } from "@/types"

interface UploadFormProps {
  onUploadComplete: (video: Video) => void
}

export function UploadForm({ onUploadComplete }: UploadFormProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<string[]>(["All"])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const videoInputRef = useRef<HTMLInputElement>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let isMounted = true

    async function loadCategories() {
      try {
        const data = await metaService.getCategories()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data)
        }
      } catch (e) {
        console.error("Failed to load categories", e)
      }
    }

    loadCategories()
    return () => {
      isMounted = false
    }
  }, [])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!description.trim()) newErrors.description = "Description is required"
    if (!category) newErrors.category = "Category is required"
    if (!videoFile) newErrors.video = "Video file is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("video/")) {
        setErrors((prev) => ({ ...prev, video: "Please select a valid video file" }))
        return
      }
      setVideoFile(file)
      setErrors((prev) => ({ ...prev, video: "" }))
    }
  }

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, thumbnail: "Please select a valid image file" }))
        return
      }
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setThumbnailPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !user) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("category", category)
      if (videoFile) formData.append("video", videoFile)
      if (thumbnailFile) formData.append("thumbnail", thumbnailFile)

      const video = await videoService.uploadVideo(formData)
      onUploadComplete(video)

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("")
      setVideoFile(null)
      setThumbnailFile(null)
      setThumbnailPreview(null)
    } catch (error) {
      console.error("Upload failed:", error)
      setErrors((prev) => ({ ...prev, submit: "Upload failed. Please try again." }))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{errors.submit}</div>
      )}

      {/* Video Upload */}
      <div className="space-y-2">
        <Label>Video File *</Label>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoSelect}
          className="hidden"
          aria-label="Select video file"
        />
        {videoFile ? (
          <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-4">
            <div className="flex items-center gap-3">
              <FileVideo className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{videoFile.name}</p>
                <p className="text-sm text-muted-foreground">{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setVideoFile(null)}
              aria-label="Remove video"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 p-8 transition-colors hover:border-primary hover:bg-secondary"
          >
            <Upload className="mb-2 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Click to upload video</p>
            <p className="text-sm text-muted-foreground">MP4, WebM, or MOV</p>
          </button>
        )}
        {errors.video && <p className="text-sm text-destructive">{errors.video}</p>}
      </div>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <Label>Thumbnail (Optional)</Label>
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          onChange={handleThumbnailSelect}
          className="hidden"
          aria-label="Select thumbnail image"
        />
        {thumbnailPreview ? (
          <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg bg-secondary">
            <img
              src={thumbnailPreview || "/placeholder.svg"}
              alt="Thumbnail preview"
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => {
                setThumbnailFile(null)
                setThumbnailPreview(null)
              }}
              aria-label="Remove thumbnail"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => thumbnailInputRef.current?.click()}
            className="flex w-full max-w-xs flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 p-6 transition-colors hover:border-primary hover:bg-secondary"
          >
            <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">Upload thumbnail</p>
          </button>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          className="bg-secondary border-0"
          maxLength={100}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.title && <span className="text-destructive">{errors.title}</span>}
          <span className="ml-auto">{title.length}/100</span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe your video"
          className="min-h-[120px] bg-secondary border-0"
          maxLength={5000}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          {errors.description && <span className="text-destructive">{errors.description}</span>}
          <span className="ml-auto">{description.length}/5000</span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="bg-secondary border-0">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.slice(1).map((cat) => (
              <SelectItem key={cat} value={cat.toLowerCase()}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isUploading}>
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Video
          </>
        )}
      </Button>
    </form>
  )
}
