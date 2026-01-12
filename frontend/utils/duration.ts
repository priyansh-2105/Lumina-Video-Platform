/**
 * Format duration in seconds to a human-readable string
 * @param seconds - Duration in seconds
 * @returns Formatted duration string (e.g., "1:05", "9:42")
 */
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) {
    return "0:00";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

/**
 * Check if duration is realistic (not 0:00 for actual videos)
 * @param seconds - Duration in seconds
 * @returns true if duration seems realistic
 */
export function isRealisticDuration(seconds: number): boolean {
  // Consider anything under 10 seconds as unrealistic for a proper video
  return seconds > 10;
}
