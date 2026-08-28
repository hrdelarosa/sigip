import type { PaginatedResponse } from '../common/pagination.contracts'

export const AUDIT_ACTIONS = [
  'LOGIN_SUCCEEDED',
  'LOGIN_FAILED',
  'LOGOUT',
  'SESSION_REVOKED',
  'SESSIONS_REVOKED',
  'CREATED',
  'UPDATED',
  'STATUS_CHANGED',
  'PASSWORD_CHANGED',
  'ROLE_CHANGED',
  'PERMISSIONS_CHANGED',
  'CANCELLED',
  'UPLOADED',
  'DELETED',
] as const

export type AuditAction = (typeof AUDIT_ACTIONS)[number]

export const AUDIT_ENTITY_TYPES = [
  'AUTH',
  'SESSION',
  'USER',
  'ROLE',
  'PERMISSION',
  'ORGANIZATIONAL_UNIT',
  'POSITION',
  'EMPLOYEE',
  'EMPLOYEE_ASSIGNMENT',
  'EMPLOYEE_VACATION_ADJUSTMENT',
  'INCIDENT_TYPE',
  'INCIDENT',
  'DOCUMENT_TYPE',
  'DOCUMENT',
] as const

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number]

export type AuditJsonValue =
  | string
  | number
  | boolean
  | null
  | AuditJsonValue[]
  | { [key: string]: AuditJsonValue }

export interface AuditActorResponse {
  id: string
  username: string
  fullName: string
}

export interface AuditLogResponse {
  id: string
  userId: string | null
  sessionId: string | null
  actor: AuditActorResponse | null
  action: AuditAction
  entityType: AuditEntityType
  entityId: string | null
  oldValues: AuditJsonValue | null
  newValues: AuditJsonValue | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export type AuditLogsResponse = PaginatedResponse<AuditLogResponse>
