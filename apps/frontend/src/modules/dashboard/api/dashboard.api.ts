import { apiRequest } from '@/lib/api/api-client'
import type {
  DashboardActiveIncidentsResponse,
  DashboardIncidentTrendResponse,
  DashboardIncidentsByTypeResponse,
  DashboardRecentIncidentsResponse,
  DashboardSummaryResponse,
  DashboardUpcomingReturnsResponse,
} from '@sigip/shared'

export function getDashboardSummary(
  signal?: AbortSignal,
): Promise<DashboardSummaryResponse> {
  return apiRequest<DashboardSummaryResponse>('/dashboard/summary', { signal })
}

export function getActiveIncidents(
  signal?: AbortSignal,
): Promise<DashboardActiveIncidentsResponse> {
  return apiRequest<DashboardActiveIncidentsResponse>(
    '/dashboard/active-incidents',
    { signal },
  )
}

export function getIncidentsByType(
  signal?: AbortSignal,
): Promise<DashboardIncidentsByTypeResponse> {
  return apiRequest<DashboardIncidentsByTypeResponse>(
    '/dashboard/incidents-by-type',
    { signal },
  )
}

export function getIncidentTrend(
  period: '3m' | '6m' | 'ytd' | '12m',
  signal?: AbortSignal,
): Promise<DashboardIncidentTrendResponse> {
  return apiRequest<DashboardIncidentTrendResponse>(
    `/dashboard/incident-trend?period=${period}`,
    { signal },
  )
}

export function getUpcomingReturns(
  signal?: AbortSignal,
): Promise<DashboardUpcomingReturnsResponse> {
  return apiRequest<DashboardUpcomingReturnsResponse>(
    '/dashboard/upcoming-returns',
    { signal },
  )
}

export function getRecentIncidents(
  signal?: AbortSignal,
): Promise<DashboardRecentIncidentsResponse> {
  return apiRequest<DashboardRecentIncidentsResponse>(
    '/dashboard/recent-incidents',
    { signal },
  )
}
