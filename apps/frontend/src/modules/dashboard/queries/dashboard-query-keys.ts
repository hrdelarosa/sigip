export const dashboardQueryKeys = {
  summary: () => ['dashboard', 'summary'] as const,
  activeIncidents: () => ['dashboard', 'active-incidents'] as const,
  incidentsByType: () => ['dashboard', 'incidents-by-type'] as const,
  incidentTrend: (period: string) => ['dashboard', 'incident-trend', period] as const,
  upcomingReturns: () => ['dashboard', 'upcoming-returns'] as const,
  recentIncidents: () => ['dashboard', 'recent-incidents'] as const,
}
