import { apiRequest } from '@/lib/api/api-client'
import type { AuditListParams, AuditLog, AuditLogs } from '../types/audit.types'

export function getAuditLogs(
  params: AuditListParams,
  signal?: AbortSignal,
): Promise<AuditLogs> {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') searchParams.set(key, String(value))
  })

  return apiRequest<AuditLogs>(`/audit?${searchParams.toString()}`, { signal })
}

export function getAuditLog(id: string, signal?: AbortSignal): Promise<AuditLog> {
  return apiRequest<AuditLog>(`/audit/${id}`, { signal })
}
