import {
  boolean,
  check,
  index,
  int,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import {
  INCIDENT_APPOINTMENT_SCOPES,
  INCIDENT_TEMPORAL_MODES,
} from '@sigip/shared';

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';

export const incidentTypes = mysqlTable(
  'incident_types',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    code: varchar('code', {
      length: 50,
    }).notNull(),
    name: varchar('name', {
      length: 150,
    }).notNull(),
    description: text('description'),
    temporalMode: varchar('temporal_mode', {
      length: 30,
      enum: INCIDENT_TEMPORAL_MODES,
    }).notNull(),
    appointmentScope: varchar('appointment_scope', {
      length: 30,
      enum: INCIDENT_APPOINTMENT_SCOPES,
    })
      .notNull()
      .default('ALL'),
    isActive: boolean('is_active').notNull().default(true),
    sortOrder: int('sort_order').notNull().default(0),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('incident_types_code_unique').on(table.code),
    index('incident_types_active_sort_index').on(
      table.isActive,
      table.sortOrder,
    ),
    check(
      'incident_types_temporal_mode_check',
      sql`${table.temporalMode} IN ('SINGLE_DATE', 'MULTIPLE_DATES', 'DATE_RANGE')`,
    ),
    check(
      'incident_types_appointment_scope_check',
      sql`${table.appointmentScope} IN ('ALL', 'BASE', 'CONFIANZA')`,
    ),
    check('incident_types_sort_order_check', sql`${table.sortOrder} >= 0`),
  ],
);

export type IncidentTypeRow = typeof incidentTypes.$inferSelect;
export type NewIncidentTypeRow = typeof incidentTypes.$inferInsert;
