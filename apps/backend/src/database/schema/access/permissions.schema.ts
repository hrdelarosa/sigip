import { mysqlTable, uniqueIndex, varchar } from 'drizzle-orm/mysql-core';

import { uuidBinary } from '../columns/uuid.column';
import { createdAtColumn } from '../columns/timestamps.columns';

export const permissions = mysqlTable(
  'permissions',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    code: varchar('code', { length: 100 }).notNull(),
    description: varchar('description', {
      length: 500,
    }),
    createdAt: createdAtColumn(),
  },
  (table) => [uniqueIndex('permissions_code_unique').on(table.code)],
);

export type PermissionsRow = typeof permissions.$inferSelect;
export type NewPermissionsRow = typeof permissions.$inferInsert;
