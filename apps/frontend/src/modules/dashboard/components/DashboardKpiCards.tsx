import type { UseQueryResult } from '@tanstack/react-query'
import {
  CalendarClockIcon,
  CalendarOffIcon,
  ClipboardClockIcon,
  UsersIcon,
} from 'lucide-react'
import type { DashboardSummaryResponse } from '@sigip/shared'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
        icon={UsersIcon}
      />
      <KpiCard
        label="Ausentes hoy por incidencia"
        value={summary.absentToday}
        icon={CalendarOffIcon}
        hint={`${summary.absenceRate}% del personal activo`}
      />
      <KpiCard
        label="Incidencias en curso hoy"
        value={summary.activeIncidentsToday}
        icon={ClipboardClockIcon}
      />
      <KpiCard
        label="Incidencias del mes"
        value={summary.monthIncidents}
        icon={CalendarClockIcon}
      />
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string
  value: number
  icon: typeof UsersIcon
  hint?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Icon aria-hidden="true" className="size-4" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tabular-nums">{value}</div>
        {hint ? (
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  )
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