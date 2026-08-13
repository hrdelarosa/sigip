import {
  foreignKey,
  index,
  json,
  mysqlTable,
  varchar,
} from 'drizzle-orm/mysql-core';
import type {
  AuditAction,
  AuditEntityType,
  AuditJsonValue,
} from '@sigip/shared';

import { sessions, users } from '../access';
import { createdAtColumn } from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';

export const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    userId: uuidBinary('user_id'),
    sessionId: uuidBinary('session_id'),
    action: varchar('action', { length: 100 }).$type<AuditAction>().notNull(),
    entityType: varchar('entity_type', { length: 100 })
      .$type<AuditEntityType>()
      .notNull(),
    entityId: uuidBinary('entity_id'),
    oldValues: json('old_values').$type<AuditJsonValue>(),
    newValues: json('new_values').$type<AuditJsonValue>(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index('audit_logs_created_at_index').on(table.createdAt),
    index('audit_logs_entity_type_entity_id_index').on(
      table.entityType,
      table.entityId,
    ),
    index('audit_logs_user_id_created_at_index').on(
      table.userId,
      table.createdAt,
    ),
    index('audit_logs_session_id_created_at_index').on(
      table.sessionId,
      table.createdAt,
    ),
    foreignKey({
      name: 'audit_logs_user_id_users_id_fk',
      columns: [table.userId],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('set null'),
    foreignKey({
      name: 'audit_logs_session_id_sessions_id_fk',
      columns: [table.sessionId],
      foreignColumns: [sessions.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
);

export type AuditLogRow = typeof auditLogs.$inferSelect;
export type NewAuditLogRow = typeof auditLogs.$inferInsert;
