import type { IncidentsReportResponse } from '@sigip/shared'
import { ClipboardListIcon, RatioIcon, UsersIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

export function ReportSummaryCards({
  summary,
}: {
  summary: IncidentsReportResponse['summary']
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <SummaryCard
        label="Incidencias"
        value={summary.totalIncidents}
        icon={ClipboardListIcon}
      />
      <SummaryCard
        label="Trabajadores involucrados"
        value={summary.totalEmployees}
        icon={UsersIcon}
      />
      <SummaryCard
        label="Promedio por trabajador"
        value={summary.averageIncidentsPerEmployee.toFixed(1)}
        suffix="incidencias"
        icon={RatioIcon}
      />
    </div>
  )
}

function SummaryCard({
  label,
  value,
  suffix,
  icon: Icon,
}: {
  label: string
  value: number | string
  suffix?: string
  icon: typeof ClipboardListIcon
}) {
  return (
    <Card className="shadow-xs">
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
          {suffix ? <p className="mt-1 text-xs text-muted-foreground">{suffix}</p> : null}
        </div>
        <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
      </CardContent>
    </Card>
  )
}
