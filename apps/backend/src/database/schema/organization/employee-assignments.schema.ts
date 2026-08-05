import { sql } from 'drizzle-orm';
import {
  check,
  date,
  foreignKey,
  index,
  mysqlTable,
  text,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';

import { employees } from './employees.schema';
import { organizationalUnits } from './organizational-units.schema';
import { positions } from './positions.schema';

export const APPOINTMENT_TYPES = ['BASE', 'CONFIANZA'] as const;

export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

export const employeeAssignments = mysqlTable(
  'employee_assignments',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    employeeId: uuidBinary('employee_id').notNull(),
    organizationalUnitId: uuidBinary('organizational_unit_id').notNull(),
    positionId: uuidBinary('position_id').notNull(),
    appointmentType: varchar('appointment_type', {
      length: 30,
      enum: APPOINTMENT_TYPES,
    }).notNull(),
    schedule: varchar('schedule', {
      length: 150,
    }),
    effectiveFrom: date('effective_from', {
      mode: 'date',
    }).notNull(),
    effectiveTo: date('effective_to', {
      mode: 'date',
    }),
    notes: text('notes'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table) => [
    uniqueIndex('employee_assignments_id_employee_id_unique').on(
      table.id,
      table.employeeId,
    ),
    index('employee_assignments_employee_dates_index').on(
      table.employeeId,
      table.effectiveFrom,
      table.effectiveTo,
    ),
    index('employee_assignments_unit_dates_index').on(
      table.organizationalUnitId,
      table.effectiveFrom,
      table.effectiveTo,
    ),
    index('employee_assignments_position_id_index').on(table.positionId),
    check(
      'employee_assignments_appointment_type_check',
      sql`${table.appointmentType} IN ('BASE', 'CONFIANZA')`,
    ),
    check(
      'employee_assignments_effective_dates_check',
      sql`
        ${table.effectiveTo} IS NULL
        OR ${table.effectiveTo} >= ${table.effectiveFrom}
      `,
    ),
    foreignKey({
      name: 'employee_assignments_employee_id_fk',
      columns: [table.employeeId],
      foreignColumns: [employees.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'employee_assignments_organizational_unit_id_fk',
      columns: [table.organizationalUnitId],
      foreignColumns: [organizationalUnits.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'employee_assignments_position_id_fk',
      columns: [table.positionId],
      foreignColumns: [positions.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
  ],
);

export type EmployeeAssignmentRow = typeof employeeAssignments.$inferSelect;
export type NewEmployeeAssignmentRow = typeof employeeAssignments.$inferInsert;
