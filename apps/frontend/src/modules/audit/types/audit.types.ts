import type {
  AuditAction,
  AuditEntityType,
  AuditLogResponse,
  AuditLogsResponse,
} from '@sigip/shared'

export type AuditLog = AuditLogResponse
export type AuditLogs = AuditLogsResponse

export interface AuditListParams {
  page?: number
  limit?: number
  action?: AuditAction
  entityType?: AuditEntityType
  entityId?: string
  userId?: string
  sessionId?: string
  createdFrom?: string
  createdTo?: string
}
