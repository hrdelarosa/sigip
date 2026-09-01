import {
  boolean,
  index,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';

export const offices = mysqlTable(
  'offices',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: varchar('description', { length: 355 }),
    municipality: varchar('municipality', { length: 100 }),
    address: varchar('address', { length: 255 }),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: int('sort_order').notNull().default(0),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('offices_code_unique').on(table.code),
    index('offices_active_sort_index').on(table.isActive, table.sortOrder),
  ],
);

export type OfficeRow = typeof offices.$inferSelect;
export type NewOfficeRow = typeof offices.$inferInsert;
