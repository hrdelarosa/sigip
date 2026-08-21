import { useQuery } from '@tanstack/react-query'

import { buildIncidentsReportFilters, type ReportsFilterState } from '../lib/report-filters'
import { incidentsReportQueryOptions } from '../queries/report-query-options'

export function useIncidentsReport(
  state: ReportsFilterState,
  enabled: boolean,
) {
  const filters = buildIncidentsReportFilters(state)

  return useQuery(incidentsReportQueryOptions(filters, enabled))
}
