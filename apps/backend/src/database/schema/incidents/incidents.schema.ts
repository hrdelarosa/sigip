import {
  check,
  date,
  datetime,
  foreignKey,
  index,
  int,
  mysqlTable,
  text,
  varchar,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';
import { INCIDENT_STATUSES } from '@sigip/shared';

import { users } from '../access';
import { employeeAssignments, employees } from '../organization';

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';

import { incidentTypes } from './incident-types.schema';

export const incidents = mysqlTable(
  'incidents',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    employeeId: uuidBinary('employee_id').notNull(),
    employeeAssignmentId: uuidBinary('employee_assignment_id'),
    incidentTypeId: uuidBinary('incident_type_id').notNull(),
    issuedDate: date('issued_date', {
      mode: 'date',
    }),
    receivedAt: datetime('received_at', {
      mode: 'date',
      fsp: 6,
    }).notNull(),
    referenceYear: int('reference_year'),
    observations: text('observations'),
    status: varchar('status', {
      length: 30,
      enum: INCIDENT_STATUSES,
    })
      .notNull()
      .default('REGISTERED'),
    registeredBy: uuidBinary('registered_by').notNull(),
    updatedBy: uuidBinary('updated_by'),
    cancelledAt: datetime('cancelled_at', {
      mode: 'date',
      fsp: 6,
    }),
    cancelledBy: uuidBinary('cancelled_by'),
    cancellationReason: text('cancellation_reason'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    index('incidents_employee_status_index').on(table.employeeId, table.status),
    index('incidents_type_status_index').on(table.incidentTypeId, table.status),
    index('incidents_assignment_index').on(table.employeeAssignmentId),
    index('incidents_status_received_index').on(table.status, table.receivedAt),
    index('incidents_registered_by_created_index').on(
      table.registeredBy,
      table.createdAt,
    ),
    foreignKey({
      name: 'incidents_employee_id_fk',
      columns: [table.employeeId],
      foreignColumns: [employees.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'incidents_assignment_employee_fk',
      columns: [table.employeeAssignmentId, table.employeeId],
      foreignColumns: [employeeAssignments.id, employeeAssignments.employeeId],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'incidents_assignment_id_fk',
      columns: [table.employeeAssignmentId],
      foreignColumns: [employeeAssignments.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'incidents_incident_type_id_fk',
      columns: [table.incidentTypeId],
      foreignColumns: [incidentTypes.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'incidents_registered_by_fk',
      columns: [table.registeredBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'incidents_updated_by_fk',
      columns: [table.updatedBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'incidents_cancelled_by_fk',
      columns: [table.cancelledBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    check(
      'incidents_status_check',
      sql`${table.status} IN ('REGISTERED', 'CANCELLED')`,
    ),
    check(
      'incidents_cancellation_fields_check',
      sql`
        (${table.status} = 'REGISTERED'
          AND ${table.cancelledAt} IS NULL
          AND ${table.cancelledBy} IS NULL
          AND ${table.cancellationReason} IS NULL)
        OR
        (${table.status} = 'CANCELLED'
          AND ${table.cancelledAt} IS NOT NULL
          AND ${table.cancelledBy} IS NOT NULL
          AND ${table.cancellationReason} IS NOT NULL)
      `,
    ),
  ],
);

export type IncidentRow = typeof incidents.$inferSelect;
export type NewIncidentRow = typeof incidents.$inferInsert;
