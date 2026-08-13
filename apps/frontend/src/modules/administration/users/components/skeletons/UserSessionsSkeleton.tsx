import { Skeleton } from '@/components/ui/skeleton'

export function UserSessionsSkeleton() {
  return Array.from({ length: 2 }).map((_, index) => (
    <div key={index} className="space-y-4 rounded-md border p-4">
      <div className="flex gap-3">
        <Skeleton className="size-9" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 5 }).map((_, detailIndex) => (
          <div
            key={detailIndex}
            className="flex gap-3 rounded-md border bg-muted/20 p-3"
          >
            <Skeleton className="size-8 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  ))
}
