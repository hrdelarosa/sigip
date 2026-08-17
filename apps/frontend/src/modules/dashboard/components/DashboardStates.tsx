import { RotateCcwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function DashboardError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:flex-row sm:items-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCcwIcon data-icon="inline-start" />
        Reintentar
      </Button>
    </div>
  )
}