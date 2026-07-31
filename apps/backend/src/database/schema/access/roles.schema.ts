import {
  boolean,
  index,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { uuidBinary } from '../columns/uuid.column';
import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns';

export const roles = mysqlTable(
  'roles',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    description: varchar('description', { length: 355 }).notNull(),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('roles_code_unique').on(table.code),
    index('roles_is_active_index').on(table.isActive),
  ],
);

export type RoleRow = typeof roles.$inferSelect;
export type NewRoleRow = typeof roles.$inferInsert;
