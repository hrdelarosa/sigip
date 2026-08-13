import { queryOptions } from '@tanstack/react-query'
import { getAuditLog, getAuditLogs } from '../api/audit.api'
import type { AuditListParams } from '../types/audit.types'

export const auditQueryKeys = {
  all: ['audit'] as const,
  list: (params: AuditListParams) => ['audit', 'list', params] as const,
  detail: (id: string) => ['audit', 'detail', id] as const,
}

export const auditListQueryOptions = (params: AuditListParams) =>
  queryOptions({
    queryKey: auditQueryKeys.list(params),
    queryFn: ({ signal }) => getAuditLogs(params, signal),
    staleTime: 30_000,
  })

export const auditDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: auditQueryKeys.detail(id),
    queryFn: ({ signal }) => getAuditLog(id, signal),
    staleTime: 30_000,
  })
