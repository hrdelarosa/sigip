import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq, gte, lte, type SQL } from 'drizzle-orm';

import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';
import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import type { DrizzleTransaction } from '../../../database/database.types';
import { auditLogs, users } from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type { AuditLogModel } from '../models/audit-log.model';
import type { AuditFilters } from '../types/audit.types';
import type { AppendAuditLogData } from '../types/audit.types';
import { AuditRepository } from './audit.repository';
import { generateUuidV7 } from '../../../common/utils/generate-uuid-v7.util';

type AuditLogWithActorRow = {
  auditLog: typeof auditLogs.$inferSelect;
  actor: Pick<typeof users.$inferSelect, 'id' | 'username' | 'fullName'> | null;
};

@Injectable()
export class DrizzleAuditRepository implements AuditRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  async findAll(
    filters: AuditFilters,
  ): Promise<PaginatedResult<AuditLogModel>> {
    const conditions = this.buildConditions(filters);
    const whereCondition = conditions.length ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.limit;

    const [rows, totalResult] = await Promise.all([
      this.db
        .select({
          auditLog: auditLogs,
          actor: {
            id: users.id,
            username: users.username,
            fullName: users.fullName,
          },
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(whereCondition)
        .orderBy(desc(auditLogs.createdAt), desc(auditLogs.id))
        .limit(filters.limit)
        .offset(offset),
      this.db.select({ total: count() }).from(auditLogs).where(whereCondition),
    ]);

    return {
      items: rows.map((row) => this.toModel(row)),
      total: totalResult[0]?.total ?? 0,
    };
  }

  async findById(id: string): Promise<AuditLogModel | null> {
    const [row] = await this.db
      .select({
        auditLog: auditLogs,
        actor: {
          id: users.id,
          username: users.username,
          fullName: users.fullName,
        },
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(eq(auditLogs.id, uuidToBuffer(id)))
      .limit(1);

    return row ? this.toModel(row) : null;
  }

  async append(
    data: AppendAuditLogData,
    transaction?: DrizzleTransaction,
  ): Promise<void> {
    const executor = transaction ?? this.db;

    await executor.insert(auditLogs).values({
      id: uuidToBuffer(generateUuidV7()),
      userId: data.userId ? uuidToBuffer(data.userId) : null,
      sessionId: data.sessionId ? uuidToBuffer(data.sessionId) : null,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId ? uuidToBuffer(data.entityId) : null,
      oldValues: data.oldValues ?? null,
      newValues: data.newValues ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      createdAt: data.createdAt ?? new Date(),
    });
  }

  private buildConditions(filters: AuditFilters): SQL[] {
    const conditions: SQL[] = [];

    if (filters.action) {
      conditions.push(eq(auditLogs.action, filters.action));
    }
    if (filters.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }
    if (filters.entityId) {
      conditions.push(eq(auditLogs.entityId, uuidToBuffer(filters.entityId)));
    }
    if (filters.userId) {
      conditions.push(eq(auditLogs.userId, uuidToBuffer(filters.userId)));
    }
    if (filters.sessionId) {
      conditions.push(eq(auditLogs.sessionId, uuidToBuffer(filters.sessionId)));
    }
    if (filters.createdFrom) {
      conditions.push(gte(auditLogs.createdAt, filters.createdFrom));
    }
    if (filters.createdTo) {
      conditions.push(lte(auditLogs.createdAt, filters.createdTo));
    }

    return conditions;
  }

  private toModel(row: AuditLogWithActorRow): AuditLogModel {
    const { auditLog, actor } = row;

    return {
      id: bufferToUuid(auditLog.id),
      userId: auditLog.userId ? bufferToUuid(auditLog.userId) : null,
      sessionId: auditLog.sessionId ? bufferToUuid(auditLog.sessionId) : null,
      actor: actor
        ? {
            id: bufferToUuid(actor.id),
            username: actor.username,
            fullName: actor.fullName,
          }
        : null,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId ? bufferToUuid(auditLog.entityId) : null,
      oldValues: auditLog.oldValues,
      newValues: auditLog.newValues,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
  }
}
