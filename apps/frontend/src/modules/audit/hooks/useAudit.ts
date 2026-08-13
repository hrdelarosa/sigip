import { useQuery } from '@tanstack/react-query'
import {
  auditDetailQueryOptions,
  auditListQueryOptions,
} from '../queries/audit-query-options'
import type { AuditListParams } from '../types/audit.types'

export function useAuditLogs(params: AuditListParams) {
  return useQuery(auditListQueryOptions(params))
}

export function useAuditLog(id: string | null) {
  return useQuery({
    ...auditDetailQueryOptions(id ?? ''),
    enabled: Boolean(id),
  })
}
