import type { IncidentsReportResponse } from '@sigip/shared'
import { CalendarRangeIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

import { formatReportDate, formatReportPeriodType } from '../lib/report-formatters'

export function ReportPreviewHeader({
  report,
  filters,
}: {
  report: IncidentsReportResponse
  filters: {
    incidentTypeLabel?: string
    organizationalUnitLabel?: string
    includeCancelled: boolean
  }
}) {
  const badges = [
    filters.incidentTypeLabel,
    filters.organizationalUnitLabel,
    filters.includeCancelled ? 'Incluye canceladas' : undefined,
  ].filter(Boolean) as string[]

  return (
    <header className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <CalendarRangeIcon className="size-4" aria-hidden="true" />
          Vista previa del reporte
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {report.period.label}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatReportDate(report.period.startDate)} —{' '}
          {formatReportDate(report.period.endDate)}
        </p>
        {badges.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <Badge variant="outline" className="w-fit">
        {formatReportPeriodType(report.period.type)} · {report.summary.totalIncidents}{' '}
        {report.summary.totalIncidents === 1 ? 'incidencia' : 'incidencias'}
      </Badge>
    </header>
  )
}
