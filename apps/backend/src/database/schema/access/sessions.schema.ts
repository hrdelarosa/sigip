import {
  char,
  datetime,
  foreignKey,
  index,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { createdAtColumn } from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';
import { users } from './users.schema';

export const sessions = mysqlTable(
  'sessions',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    userId: uuidBinary('user_id').notNull(),
    tokenHash: char('token_hash', { length: 64 }).notNull(),
    createdAt: createdAtColumn(),
    lastActivityAt: datetime('last_activity_at', {
      mode: 'date',
      fsp: 6,
    }).notNull(),
    idleExpiresAt: datetime('idle_expires_at', {
      mode: 'date',
      fsp: 6,
    }).notNull(),
    absoluteExpiresAt: datetime('absolute_expires_at', {
      mode: 'date',
      fsp: 6,
    }).notNull(),
    revokedAt: datetime('revoked_at', {
      mode: 'date',
      fsp: 6,
    }),
    revokedBy: uuidBinary('revoked_by'),
    revokedReason: varchar('revoked_reason', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
  },
  (table) => [
    uniqueIndex('sessions_token_hash_unique').on(table.tokenHash),
    index('sessions_user_id_revoked_at_absolute_expires_at_index').on(
      table.userId,
      table.revokedAt,
      table.absoluteExpiresAt,
    ),
    index('sessions_idle_expires_at_index').on(table.idleExpiresAt),
    index('sessions_absolute_expires_at_index').on(table.absoluteExpiresAt),
    foreignKey({
      name: 'sessions_user_id_users_id_fk',
      columns: [table.userId],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'sessions_revoked_by_users_id_fk',
      columns: [table.revokedBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
);

export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;
