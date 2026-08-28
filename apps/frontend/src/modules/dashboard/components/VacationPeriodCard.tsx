import type { DashboardSummaryResponse } from '@sigip/shared'
import type { UseQueryResult } from '@tanstack/react-query'
import { CalendarDaysIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00.000Z`))
}

export function VacationPeriodCard({
  summaryQuery,
}: {
  summaryQuery: UseQueryResult<DashboardSummaryResponse>
}) {
  if (summaryQuery.isPending) {
    return <Skeleton className="h-24 w-full" />
  }
  if (summaryQuery.isError) return null

  const period = summaryQuery.data.currentVacationPeriod

  return (
    <Card className="border-primary/20 bg-primary/5 shadow-none">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-md bg-primary/10 p-2 text-primary">
            <CalendarDaysIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-medium">Periodo vacacional vigente</h2>
              <Badge variant="outline">
                {period.period === 'FIRST' ? 'Primer periodo' : 'Segundo periodo'}{' '}
                {period.year}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Del {formatDate(period.startDate)} al {formatDate(period.endDate)}
            </p>
          </div>
        </div>
        <div className="sm:text-right">
          <span className="text-3xl font-semibold tabular-nums">
            {period.daysRemaining}
          </span>
          <span className="ml-2 text-sm text-muted-foreground">
            días naturales restantes
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
