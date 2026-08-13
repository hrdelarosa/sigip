import type {
  AuditAction,
  AuditEntityType,
  AuditJsonValue,
} from '@sigip/shared';

export interface AuditFilters {
  page: number;
  limit: number;
  action?: AuditAction;
  entityType?: AuditEntityType;
  entityId?: string;
  userId?: string;
  sessionId?: string;
  createdFrom?: Date;
  createdTo?: Date;
}

export interface AppendAuditLogData {
  userId?: string | null;
  sessionId?: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId?: string | null;
  oldValues?: AuditJsonValue | null;
  newValues?: AuditJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
}

export interface AuditActorContext {
  userId: string;
  sessionId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}
