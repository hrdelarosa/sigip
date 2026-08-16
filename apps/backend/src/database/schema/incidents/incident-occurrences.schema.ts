import type { SQL } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import {
  check,
  date,
  foreignKey,
  index,
  mysqlTable,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';

import { uuidBinary } from '../columns/uuid.column';
import { createdAtColumn } from '../columns/timestamps.columns';
import { incidents } from './incidents.schema';

export const incidentOccurrences = mysqlTable(
  'incident_occurrences',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    incidentId: uuidBinary('incident_id').notNull(),
    startDate: date('start_date', {
      mode: 'date',
    }).notNull(),
    endDate: date('end_date', {
      mode: 'date',
    }),
    normalizedEndDate: date('normalized_end_date', {
      mode: 'date',
    })
      .notNull()
      .generatedAlwaysAs(
        (): SQL =>
          sql`coalesce(${incidentOccurrences.endDate}, ${incidentOccurrences.startDate})`,
        {
          mode: 'stored',
        },
      ),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index('incident_occurrences_incident_id_index').on(table.incidentId),
    index('incident_occurrences_dates_index').on(
      table.startDate,
      table.endDate,
    ),
    uniqueIndex('incident_occurrences_unique_dates').on(
      table.incidentId,
      table.startDate,
      table.normalizedEndDate,
    ),
    foreignKey({
      name: 'incident_occurrences_incident_id_fk',
      columns: [table.incidentId],
      foreignColumns: [incidents.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    check(
      'incident_occurrences_dates_check',
      sql`${table.endDate} IS NULL OR ${table.endDate} >= ${table.startDate}`,
    ),
  ],
);

export type IncidentOccurrenceRow = typeof incidentOccurrences.$inferSelect;
export type NewIncidentOccurrenceRow = typeof incidentOccurrences.$inferInsert;
