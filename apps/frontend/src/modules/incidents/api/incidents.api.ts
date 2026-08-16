import { apiDownload, apiRequest } from '@/lib/api/api-client'

import type {
  CreateIncidentInput,
  Incident,
  IncidentListParams,
  Incidents,
  UpdateIncidentInput,
  CancelIncidentInput,
  IncidentDocuments,
  IncidentTypeListParams,
  IncidentTypes,
} from '../types/incident.types'

export function getIncidents(
  params: IncidentListParams = {},
  signal?: AbortSignal,
): Promise<Incidents> {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()

  return apiRequest<Incidents>(`/incidents${query ? `?${query}` : ''}`, {
    signal,
  })
}

export function getIncidentById({
  id,
  signal,
}: {
  id: string
  signal?: AbortSignal
}): Promise<Incident> {
  return apiRequest<Incident>(`/incidents/${id}`, { signal })
}

export function getIncidentTypes(
  params: IncidentTypeListParams = {},
  signal?: AbortSignal,
): Promise<IncidentTypes> {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return apiRequest<IncidentTypes>(
    `/incident-types${query ? `?${query}` : ''}`,
    { signal },
  )
}

export function getIncidentDocuments(
  incidentId: string,
  signal?: AbortSignal,
): Promise<IncidentDocuments> {
  return apiRequest<IncidentDocuments>(`/incidents/${incidentId}/documents`, {
    signal,
  })
}

export function uploadCommissionAnnex({
  incidentId,
  file,
}: {
  incidentId: string
  file: File
}) {
  const formData = new FormData()
  formData.append('file', file)
  return apiRequest<IncidentDocuments[number]>(
    `/incidents/${incidentId}/documents`,
    { method: 'POST', body: formData },
  )
}

export async function downloadIncidentDocument(
  documentId: string,
  originalName?: string,
): Promise<{ blob: Blob; filename: string }> {
  const response = await apiDownload(`/documents/${documentId}`)

  const disposition = response.headers.get('Content-Disposition')
  const filename = getContentDispositionFilename(disposition)
  const metadataName = originalName?.trim()

  return {
    blob: await response.blob(),
    filename: filename || metadataName || 'documento.pdf',
  }
}

function getContentDispositionFilename(disposition: string | null): string | null {
  if (!disposition) return null

  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
  const basicName = disposition.match(/filename="([^"]+)"/i)?.[1]
  const candidate = encodedName ?? basicName

  if (!candidate) return null

  try {
    return decodeURIComponent(candidate).trim() || null
  } catch {
    return candidate.trim() || null
  }
}

export function createIncident({
  input,
  file,
  commissionAnnex,
}: {
  input: CreateIncidentInput
  file: File
  commissionAnnex?: File
}): Promise<Incident> {
  const formData = new FormData()

  formData.append('data', JSON.stringify(input))

  formData.append('file', file)
  if (commissionAnnex) formData.append('commissionAnnex', commissionAnnex)

  return apiRequest<Incident>('/incidents', {
    method: 'POST',
    body: formData,
  })
}

export function updateIncident({
  id,
  input,
}: {
  id: string
  input: UpdateIncidentInput
}): Promise<Incident> {
  return apiRequest<Incident>(`/incidents/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function cancelIncident({
  id,
  input,
}: {
  id: string
  input: CancelIncidentInput
}): Promise<Incident> {
  return apiRequest<Incident>(`/incidents/${id}/cancel`, {
    method: 'POST',
    body: input,
  })
}
