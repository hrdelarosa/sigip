import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import type { AuditLogModel } from '../models/audit-log.model';
import type { AuditFilters } from '../types/audit.types';
import type { AppendAuditLogData } from '../types/audit.types';
import type { DrizzleTransaction } from '../../../database/database.types';

export abstract class AuditRepository {
  abstract findAll(
    filters: AuditFilters,
  ): Promise<PaginatedResult<AuditLogModel>>;
  abstract findById(id: string): Promise<AuditLogModel | null>;
  abstract append(
    data: AppendAuditLogData,
    transaction?: DrizzleTransaction,
  ): Promise<void>;
}
