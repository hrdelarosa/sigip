import { Skeleton } from '@/components/ui/skeleton'

export function RoleDetailsSkeleton() {
  return (
    <>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </>
  )
}
