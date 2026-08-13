import { Skeleton } from '@/components/ui/skeleton'

export function UserDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <section className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-7 rounded-full" />
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <Skeleton className="h-3 w-14" />
        <div className="space-y-4 rounded-lg border p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-1.5">
                <Skeleton className="ml-auto h-4 w-32" />
                <Skeleton className="ml-auto h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </section>
    </div>
  )
}
