import {
  boolean,
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
import { offices } from './offices.schema';

export const positions = mysqlTable(
  'positions',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    officeId: uuidBinary('office_id').notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 150 }).notNull(),
    description: varchar('description', { length: 355 }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('positions_code_unique').on(table.code),
    uniqueIndex('positions_id_office_unique').on(table.id, table.officeId),
    index('positions_office_active_index').on(table.officeId, table.isActive),
    index('positions_is_active_index').on(table.isActive),
    foreignKey({
      name: 'positions_office_id_fk',
      columns: [table.officeId],
      foreignColumns: [offices.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
);

export type PositionRow = typeof positions.$inferSelect;
export type NewPositionRow = typeof positions.$inferInsert;
