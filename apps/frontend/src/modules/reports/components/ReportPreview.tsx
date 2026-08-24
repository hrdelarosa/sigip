import type { IncidentsReportResponse } from '@sigip/shared'

import { ReportDistributionCharts } from './ReportDistributionCharts'
import { ReportIncidentsTable } from './ReportIncidentsTable'
import { ReportPreviewHeader } from './ReportPreviewHeader'
import { ReportSummaryCards } from './ReportSummaryCards'

export interface ReportPreviewFilters {
  incidentTypeLabel?: string
  organizationalUnitLabel?: string
  includeCancelled: boolean
}

export function ReportPreview({
  report,
  filters,
}: {
  report: IncidentsReportResponse
  filters: ReportPreviewFilters
}) {
  return (
    <div className="space-y-6">
      <ReportPreviewHeader report={report} filters={filters} />
      <ReportSummaryCards summary={report.summary} />
      <ReportDistributionCharts
        summary={report.summary}
        hideUnitChart={Boolean(filters.organizationalUnitLabel)}
      />
      <ReportIncidentsTable items={report.items} />
    </div>
  )
}
