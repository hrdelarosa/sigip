import type {
  IncidentsReportFilters,
  IncidentsReportResponse,
} from '@sigip/shared'

import { apiDownload, apiRequest } from '@/lib/api/api-client'

export function getIncidentsReport(
  filters: IncidentsReportFilters,
  signal?: AbortSignal,
): Promise<IncidentsReportResponse> {
  return apiRequest<IncidentsReportResponse>(
    `/reports/incidents?${buildQuery(filters)}`,
    { signal },
  )
}

export async function downloadIncidentsReport(
  filters: IncidentsReportFilters,
): Promise<void> {
  const response = await apiDownload(
    `/reports/incidents/pdf?${buildQuery(filters)}`,
  )
  const blob = await response.blob()
  const disposition = response.headers.get('content-disposition')
  const filename = readFilename(disposition) ?? 'reporte-incidencias.pdf'
  const url = URL.createObjectURL(blob)

  try {
    const anchor = document.createElement('a')

    anchor.href = url
    anchor.download = filename

    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } finally {
    URL.revokeObjectURL(url)
  }
}

function buildQuery(filters: IncidentsReportFilters): string {
  const params = new URLSearchParams()

  params.set('period', filters.period)

  if (filters.fortnight) {
    params.set('fortnight', filters.fortnight)
  }

  if (filters.month !== undefined) {
    params.set('month', String(filters.month))
  }

  if (filters.year !== undefined) {
    params.set('year', String(filters.year))
  }

  if (filters.startDate) {
    params.set('startDate', filters.startDate)
  }

  if (filters.endDate) {
    params.set('endDate', filters.endDate)
  }

  if (filters.incidentTypeId) {
    params.set('incidentTypeId', filters.incidentTypeId)
  }

  if (filters.organizationalUnitId) {
    params.set('organizationalUnitId', filters.organizationalUnitId)
  }

  if (filters.includeCancelled) {
    params.set('includeCancelled', 'true')
  }

  return params.toString()
}

function readFilename(disposition: string | null): string | null {
  if (!disposition) return null

  const match = /filename="([^"]+)"/.exec(disposition)

  return match?.[1] ?? null
}
