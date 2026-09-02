import { sql } from 'drizzle-orm';
import {
  check,
  date,
  foreignKey,
  index,
  mysqlTable,
  type MySqlTableExtraConfigValue,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import {
  createdAtColumn,
  updatedAtColumn,
} from '../columns/timestamps.columns';
import { uuidBinary } from '../columns/uuid.column';
import { offices } from './offices.schema';

export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE'] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export const employees = mysqlTable(
  'employees',
  {
    id: uuidBinary('id').notNull().primaryKey(),
    officeId: uuidBinary('office_id').notNull(),
    employeeNumber: varchar('employee_number', {
      length: 50,
    }).notNull(),
    fullName: varchar('full_name', {
      length: 200,
    }).notNull(),
    hireDate: date('hire_date', {
      mode: 'date',
    }),
    status: varchar('status', {
      length: 30,
      enum: EMPLOYEE_STATUSES,
    })
      .notNull()
      .default('ACTIVE'),
    createdAt: createdAtColumn(),
    updatedAt: updatedAtColumn(),
  },
  (table): MySqlTableExtraConfigValue[] => [
    uniqueIndex('employees_employee_number_unique').on(table.employeeNumber),
    index('employees_office_id_index').on(table.officeId),
    index('employees_status_index').on(table.status),
    index('employees_full_name_index').on(table.fullName),
    check(
      'employees_status_check',
      sql`${table.status} IN ('ACTIVE', 'INACTIVE')`,
    ),
    foreignKey({
      name: 'employees_office_id_fk',
      columns: [table.officeId],
      foreignColumns: [offices.id],
    })
      .onUpdate('cascade')
      .onDelete('restrict'),
  ],
);

export type EmployeeRow = typeof employees.$inferSelect;
export type NewEmployeeRow = typeof employees.$inferInsert;
