import { apiRequest } from '@/lib/api/api-client'
import type {
  DashboardActiveIncidentsResponse,
  DashboardIncidentsByTypeResponse,
  DashboardSummaryResponse,
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