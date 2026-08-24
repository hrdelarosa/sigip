import { queryOptions } from '@tanstack/react-query'
import {
  getActiveIncidents,
  getDashboardSummary,
  getIncidentTrend,
  getRecentIncidents,
  getUpcomingReturns,
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

export function dashboardIncidentTrendQueryOptions(
  period: '3m' | '6m' | 'ytd' | '12m',
) {
  return queryOptions({
    queryKey: dashboardQueryKeys.incidentTrend(period),
    queryFn: ({ signal }) => getIncidentTrend(period, signal),
    staleTime: 5 * 60_000,
  })
}

export function dashboardUpcomingReturnsQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.upcomingReturns(),
    queryFn: ({ signal }) => getUpcomingReturns(signal),
    staleTime: 30_000,
  })
}

export function dashboardRecentIncidentsQueryOptions() {
  return queryOptions({
    queryKey: dashboardQueryKeys.recentIncidents(),
    queryFn: ({ signal }) => getRecentIncidents(signal),
    staleTime: 30_000,
  })
}
