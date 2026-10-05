import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardActiveIncidentsQueryOptions } from '../queries/dashboard-query-options'
import { dashboardIncidentsByTypeQueryOptions } from '../queries/dashboard-query-options'
import { dashboardSummaryQueryOptions } from '../queries/dashboard-query-options'
import {
  dashboardIncidentTrendQueryOptions,
  dashboardRecentIncidentsQueryOptions,
  dashboardUpcomingReturnsQueryOptions,
} from '../queries/dashboard-query-options'

export type DashboardTrendPeriod = '3m' | '6m' | 'ytd' | '12m'

export function useDashboardPage(period: DashboardTrendPeriod) {
  const [absencesOpen, setAbsencesOpen] = useState(false)
  const summaryQuery = useQuery(dashboardSummaryQueryOptions())
  const activeIncidentsQuery = useQuery(dashboardActiveIncidentsQueryOptions())
  const incidentsByTypeQuery = useQuery(dashboardIncidentsByTypeQueryOptions())
  const trendQuery = useQuery(dashboardIncidentTrendQueryOptions(period))
  const upcomingReturnsQuery = useQuery(dashboardUpcomingReturnsQueryOptions())
  const recentIncidentsQuery = useQuery(dashboardRecentIncidentsQueryOptions())

  return {
    absencesOpen,
    setAbsencesOpen,
    summaryQuery,
    activeIncidentsQuery,
    incidentsByTypeQuery,
    trendQuery,
    upcomingReturnsQuery,
    recentIncidentsQuery,
  }
}
