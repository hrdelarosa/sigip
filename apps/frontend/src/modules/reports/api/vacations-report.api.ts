import type { VacationsReportFilters, VacationsReportResponse } from '@sigip/shared'

import { apiDownload, apiRequest } from '@/lib/api/api-client'

function buildQuery(filters: VacationsReportFilters): string {
  const params = new URLSearchParams({
    year: String(filters.year),
    period: filters.period,
  })
  if (filters.officeId) params.set('officeId', filters.officeId)
  return params.toString()
}

export function getVacationsReport(
  filters: VacationsReportFilters,
  signal?: AbortSignal,
): Promise<VacationsReportResponse> {
  return apiRequest(`/reports/vacations?${buildQuery(filters)}`, { signal })
}

export async function downloadVacationsReport(
  filters: VacationsReportFilters,
): Promise<void> {
  const response = await apiDownload(`/reports/vacations/pdf?${buildQuery(filters)}`)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `reporte-saldos-vacacionales-${filters.year}.pdf`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}
