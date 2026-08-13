import type {
  AuditAction,
  AuditEntityType,
  AuditJsonValue,
} from '@sigip/shared';

export interface AuditLogModel {
  id: string;
  userId: string | null;
  sessionId: string | null;
  actor: {
    id: string;
    username: string;
    fullName: string;
  } | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string | null;
  oldValues: AuditJsonValue | null;
  newValues: AuditJsonValue | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}
