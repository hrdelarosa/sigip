import {
  boolean,
  foreignKey,
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

export const organizationalUnits = mysqlTable(
  'organizational_units',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    parentId: uuidBinary('parent_id').notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 150 }).notNull(),
    description: varchar('description', { length: 355 }),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: int('sort_order').notNull().default(0),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('organizational_units_code_unique').on(table.code),
    index('organizational_units_parent_id_index').on(table.parentId),
    index('organizational_units_is_active_sort_order_index').on(
      table.isActive,
      table.sortOrder,
    ),
    foreignKey({
      name: 'organizational_units_parent_id_fk',
      columns: [table.parentId],
      foreignColumns: [table.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
);

export type OrganizationalUnitRow = typeof organizationalUnits.$inferSelect;
export type NewOrganizationalUnitRow = typeof organizationalUnits.$inferInsert;
