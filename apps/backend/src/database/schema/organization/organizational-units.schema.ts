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
import { offices } from './offices.schema';

export const organizationalUnits = mysqlTable(
  'organizational_units',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    officeId: uuidBinary('office_id').notNull(),
    parentId: uuidBinary('parent_id'),
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
    uniqueIndex('organizational_units_id_office_unique').on(
      table.id,
      table.officeId,
    ),
    index('organizational_units_parent_office_index').on(
      table.parentId,
      table.officeId,
    ),
    index('organizational_units_office_active_sort_index').on(
      table.officeId,
      table.isActive,
      table.sortOrder,
    ),
    foreignKey({
      name: 'organizational_units_office_id_fk',
      columns: [table.officeId],
      foreignColumns: [offices.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'organizational_units_parent_office_fk',
      columns: [table.parentId, table.officeId],
      foreignColumns: [table.id, table.officeId],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
);

export type OrganizationalUnitRow = typeof organizationalUnits.$inferSelect;
export type NewOrganizationalUnitRow = typeof organizationalUnits.$inferInsert;
