import { videoService } from './api'
import type { Video } from '@/types'

export async function getCreatorVideos(creatorId: string): Promise<Video[]> {
  try {
    const allVideos = await videoService.getVideos()
    return allVideos.filter(video => video.creatorId === creatorId)
  } catch (error) {
    console.error('Failed to fetch creator videos:', error)
    return []
  }
}
