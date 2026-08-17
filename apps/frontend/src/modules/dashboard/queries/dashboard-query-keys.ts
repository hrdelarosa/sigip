export const dashboardQueryKeys = {
  summary: () => ['dashboard', 'summary'] as const,
  activeIncidents: () => ['dashboard', 'active-incidents'] as const,
  incidentsByType: () => ['dashboard', 'incidents-by-type'] as const,
}