import type { AuditLogResponse } from '@sigip/shared';

import type { AuditLogModel } from '../models/audit-log.model';

export function toAuditLogResponse(auditLog: AuditLogModel): AuditLogResponse {
  return {
    ...auditLog,
    createdAt: auditLog.createdAt.toISOString(),
  };
}
