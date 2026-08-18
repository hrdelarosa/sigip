import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { buildIncidentsReportFilters, type ReportsFilterState } from '../lib/report-filters'
import { getIncidentsReport } from '../api/reports.api'

export function useIncidentsReport(
  state: ReportsFilterState,
  enabled: boolean,
) {
  const filters = useMemo(() => buildIncidentsReportFilters(state), [state])

  return useQuery({
    queryKey: ['reports', 'incidents', filters],
    queryFn: ({ signal }) => getIncidentsReport(filters, signal),
    enabled,
  })
}