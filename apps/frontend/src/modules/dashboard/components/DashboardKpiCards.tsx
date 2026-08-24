import type { UseQueryResult } from '@tanstack/react-query'
import {
  ActivityIcon,
  CalendarRangeIcon,
  CalendarOffIcon,
  UsersIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { DashboardSummaryResponse } from '@sigip/shared'

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardError } from './DashboardStates'

interface Props {
  summaryQuery: UseQueryResult<DashboardSummaryResponse>
}

export function DashboardKpiCards({ summaryQuery }: Props) {
  if (summaryQuery.isPending) {
    return <DashboardKpiSkeleton />
  }

  if (summaryQuery.isError) {
    return (
      <DashboardError
        message="No fue posible cargar el resumen del panel."
        onRetry={() => summaryQuery.refetch()}
      />
    )
  }

  const summary = summaryQuery.data

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Personal activo"
        value={summary.activeEmployees}
        description={summary.newEmployeesThisMonth > 0 ? `+${summary.newEmployeesThisMonth} este mes` : undefined}
        icon={UsersIcon}
      />
      <KpiCard
        label="Ausentes hoy"
        value={summary.absentToday}
        description={`${summary.absenceRate}% del personal activo`}
        icon={CalendarOffIcon}
      />
      <KpiCard
        label="Incidencias activas"
        value={summary.activeIncidentsToday}
        description={`${summary.endingThisWeek} terminan esta semana`}
        icon={ActivityIcon}
      />
      <KpiCard
        label="Incidencias este mes"
        value={summary.monthIncidents}
        description={formatVariation(summary.monthVariationPercentage)}
        icon={CalendarRangeIcon}
      />
    </div>
  )
}

function KpiCard({
  label,
  value,
  description,
  icon: Icon,
}: {
  label: string
  value: number
  description?: string
  icon: LucideIcon
}) {
  return (
    <Card className="relative overflow-hidden py-0 shadow-xs">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {description ? <p className="mt-2 text-xs text-muted-foreground">{description}</p> : null}
        </div>
        <div className="rounded-lg bg-muted p-2.5 text-muted-foreground">
          <Icon className="size-5" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  )
}

function formatVariation(value: number): string {
  if (value === 0) return 'Sin variación frente al mes anterior'
  return `${value > 0 ? '+' : ''}${value}% frente al mes anterior`
}

function DashboardKpiSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Cargando resumen del panel"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="rounded-xl bg-card p-6 ring-1 ring-foreground/10"
        >
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-8 w-16" />
        </div>
      ))}
    </div>
  )
}
