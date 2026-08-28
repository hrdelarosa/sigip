import { sql } from 'drizzle-orm';
import {
  check,
  foreignKey,
  index,
  int,
  mysqlTable,
  varchar,
} from 'drizzle-orm/mysql-core';
import { VACATION_PERIODS } from '@sigip/shared';

import { users } from '../access';
import { createdAtColumn } from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';
import { employees } from './employees.schema';

export const employeeVacationAdjustments = mysqlTable(
  'employee_vacation_adjustments',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    employeeId: uuidBinary('employee_id').notNull(),
    referenceYear: int('reference_year').notNull(),
    period: varchar('period', {
      length: 20,
      enum: VACATION_PERIODS,
    }).notNull(),
    daysDelta: int('days_delta').notNull(),
    reason: varchar('reason', { length: 500 }).notNull(),
    createdBy: uuidBinary('created_by').notNull(),
    createdAt: createdAtColumn(),
  },
  (table) => [
    index('employee_vacation_adjustments_balance_index').on(
      table.employeeId,
      table.referenceYear,
      table.period,
      table.createdAt,
    ),
    index('employee_vacation_adjustments_actor_index').on(
      table.createdBy,
      table.createdAt,
    ),
    foreignKey({
      name: 'employee_vacation_adjustments_employee_fk',
      columns: [table.employeeId],
      foreignColumns: [employees.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    foreignKey({
      name: 'employee_vacation_adjustments_created_by_fk',
      columns: [table.createdBy],
      foreignColumns: [users.id],
    })
      .onUpdate('restrict')
      .onDelete('restrict'),
    check(
      'employee_vacation_adjustments_year_check',
      sql`${table.referenceYear} BETWEEN 2000 AND 2100`,
    ),
    check(
      'employee_vacation_adjustments_period_check',
      sql`${table.period} IN ('FIRST', 'SECOND')`,
    ),
    check(
      'employee_vacation_adjustments_delta_check',
      sql`${table.daysDelta} BETWEEN -10 AND 10 AND ${table.daysDelta} <> 0`,
    ),
  ],
);

export type EmployeeVacationAdjustmentRow =
  typeof employeeVacationAdjustments.$inferSelect;
export type NewEmployeeVacationAdjustmentRow =
  typeof employeeVacationAdjustments.$inferInsert;
