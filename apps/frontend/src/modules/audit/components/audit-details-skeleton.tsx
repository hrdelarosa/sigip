import { Skeleton } from '@/components/ui/skeleton'

export function AuditDetailsSkeleton() {
  return (
    <div className="space-y-4" aria-label="Cargando detalle de auditoría">
      <Skeleton className="h-80 rounded-lg" />
      <Skeleton className="h-44 rounded-lg" />
      <Skeleton className="h-44 rounded-lg" />
    </div>
  )
}
