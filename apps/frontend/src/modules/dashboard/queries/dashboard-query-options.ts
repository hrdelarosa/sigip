import { queryOptions } from '@tanstack/react-query'
import {
  getActiveIncidents,
  getDashboardSummary,
  getIncidentsByType,
} from '../api/dashboard.api'
import { dashboardQueryKeys } from './dashboard-query-keys'

export function dashboardSummaryQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.summary(),
    queryFn: ({ signal }) => getDashboardSummary(signal),
    staleTime: 30_000,
  })
}

export function dashboardActiveIncidentsQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.activeIncidents(),
    queryFn: ({ signal }) => getActiveIncidents(signal),
    staleTime: 30_000,
  })
}

export function dashboardIncidentsByTypeQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.incidentsByType(),
    queryFn: ({ signal }) => getIncidentsByType(signal),
    staleTime: 5 * 60_000,
  })
}