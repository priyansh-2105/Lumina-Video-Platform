export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video rounded-lg bg-secondary" />
      <div className="mt-3 flex gap-3">
        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-secondary" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-full rounded bg-secondary" />
          <div className="h-4 w-3/4 rounded bg-secondary" />
          <div className="h-3 w-1/2 rounded bg-secondary" />
        </div>
      </div>
    </div>
  )
}
