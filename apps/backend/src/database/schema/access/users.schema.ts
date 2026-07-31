import {
  boolean,
  datetime,
  foreignKey,
  index,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';
import { roles } from './roles.schema';

export const users = mysqlTable(
  'users',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    roleId: uuidBinary('role_id').notNull(),
    username: varchar('username', { length: 50 }).notNull(),
    fullName: varchar('full_name', { length: 150 }).notNull(),
    password: varchar('password', { length: 255 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: datetime('last_login_at', {
      mode: 'date',
      fsp: 6,
    }),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('users_username_unique').on(table.username),
    index('users_role_id_is_active_index').on(table.roleId, table.isActive),
    foreignKey({
      name: 'users_role_id_roles_id_fk',
      columns: [table.roleId],
      foreignColumns: [roles.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
