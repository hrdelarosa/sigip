import { queryOptions } from '@tanstack/react-query'
import type { IncidentsReportFilters } from '@sigip/shared'

import { getIncidentsReport } from '../api/reports.api'
import { reportQueryKeys } from './report-query-keys'

export function incidentsReportQueryOptions(
  filters: IncidentsReportFilters,
  enabled: boolean,
) {
  return queryOptions({
    queryKey: reportQueryKeys.incidents(filters),
    queryFn: ({ signal }) => getIncidentsReport(filters, signal),
    enabled,
  })
}
