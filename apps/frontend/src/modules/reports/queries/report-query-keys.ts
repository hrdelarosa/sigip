import type { IncidentsReportFilters } from '@sigip/shared'

export const reportQueryKeys = {
  incidents: (filters: IncidentsReportFilters) =>
    ['reports', 'incidents', filters] as const,
}
