import { useQuery } from '@tanstack/react-query'
import { dashboardActiveIncidentsQueryOptions } from '../queries/dashboard-query-options'
import { dashboardIncidentsByTypeQueryOptions } from '../queries/dashboard-query-options'
import { dashboardSummaryQueryOptions } from '../queries/dashboard-query-options'

export function useDashboardPage() {
  const summaryQuery = useQuery(dashboardSummaryQueryOptions())
  const activeIncidentsQuery = useQuery(dashboardActiveIncidentsQueryOptions())
  const incidentsByTypeQuery = useQuery(dashboardIncidentsByTypeQueryOptions())

  return {
    summaryQuery,
    activeIncidentsQuery,
    incidentsByTypeQuery,
  }
}