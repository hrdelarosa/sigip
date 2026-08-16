import {
  boolean,
  check,
  index,
  int,
  mysqlTable,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';

export const documentTypes = mysqlTable(
  'document_types',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    code: varchar('code', {
      length: 50,
    }).notNull(),
    name: varchar('name', {
      length: 100,
    }).notNull(),
    description: varchar('description', {
      length: 500,
    }),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: int('sort_order').notNull().default(0),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('document_types_code_unique').on(table.code),
    index('document_types_active_sort_index').on(
      table.isActive,
      table.sortOrder,
    ),
    check('document_types_sort_order_check', sql`${table.sortOrder} >= 0`),
  ],
);

export type DocumentTypeRow = typeof documentTypes.$inferSelect;
export type NewDocumentTypeRow = typeof documentTypes.$inferInsert;
