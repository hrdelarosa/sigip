import { Inject, Injectable } from '@nestjs/common';
import { and, count, eq, gte, inArray, lte, sum, sql } from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  employeeVacationAdjustments,
  employees,
  incidentOccurrences,
  incidents,
  incidentTypes,
  users,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import {
  JUSTIFICATION_CODES,
  ORDINARY_VACATION_CODES,
  getVacationPeriodDates,
  addSixCalendarMonths,
  institutionalCalendarDate,
} from '../../../common/vacation/vacation-control';
import { AuditService } from '../../audit/audit.service';
import type {
  EmployeeControlSnapshot,
  EmployeeVacationAdjustmentModel,
} from '../models/employee-control.model';
import type {
  CreateVacationAdjustmentData,
  VacationAdjustmentMutationResult,
} from '../types/employee-control.types';
import { EmployeeControlsRepository } from './employee-controls.repository';

const ORDINARY_CODES = Object.keys(ORDINARY_VACATION_CODES);

@Injectable()
export class DrizzleEmployeeControlsRepository implements EmployeeControlsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
    private readonly auditService: AuditService,
  ) {}

  async findSnapshot(employeeId: string): Promise<EmployeeControlSnapshot> {
    const employeeIdBuffer = uuidToBuffer(employeeId);
    const [vacationDates, justificationDates, adjustmentRows] =
      await Promise.all([
        this.findActiveDates(employeeIdBuffer, ORDINARY_CODES),
        this.findActiveDates(employeeIdBuffer, [...JUSTIFICATION_CODES]),
        this.db
          .select({
            adjustment: employeeVacationAdjustments,
            actor: { id: users.id, fullName: users.fullName },
          })
          .from(employeeVacationAdjustments)
          .innerJoin(users, eq(employeeVacationAdjustments.createdBy, users.id))
          .where(eq(employeeVacationAdjustments.employeeId, employeeIdBuffer))
          .orderBy(employeeVacationAdjustments.createdAt),
      ]);

    return {
      vacationDates,
      justificationDates,
      adjustments: adjustmentRows.map(({ adjustment, actor }) => ({
        id: bufferToUuid(adjustment.id),
        employeeId: bufferToUuid(adjustment.employeeId),
        year: adjustment.referenceYear,
        period: adjustment.period,
        daysDelta: adjustment.daysDelta,
        reason: adjustment.reason,
        createdBy: {
          id: bufferToUuid(actor.id),
          fullName: actor.fullName,
        },
        createdAt: adjustment.createdAt,
      })),
    };
  }

  async createVacationAdjustment(
    data: CreateVacationAdjustmentData,
  ): Promise<VacationAdjustmentMutationResult> {
    const employeeId = uuidToBuffer(data.employeeId);
    const result = await this.db.transaction(async (tx) => {
      await tx.execute(
        sql`SELECT ${employees.id} FROM ${employees} WHERE ${employees.id} = ${employeeId} FOR UPDATE`,
      );
      const [employee] = await tx
        .select({ id: employees.id, hireDate: employees.hireDate })
        .from(employees)
        .where(eq(employees.id, employeeId))
        .limit(1);

      if (!employee) return { status: 'employee-not-found' } as const;

      const code =
        data.period === 'FIRST'
          ? 'VACACIONES_PRIMER_PERIODO'
          : 'VACACIONES_SEGUNDO_PERIODO';
      const { startDate, endDate } = getVacationPeriodDates(
        data.year,
        data.period,
      );
      if (institutionalCalendarDate() < startDate) {
        return { status: 'period-not-available' } as const;
      }
      if (
        !employee.hireDate ||
        addSixCalendarMonths(employee.hireDate) > endDate
      ) {
        return { status: 'not-eligible' } as const;
      }
      const [incidentTotalRows, adjustmentTotalRows] = await Promise.all([
        tx
          .select({ value: count(incidentOccurrences.id) })
          .from(incidents)
          .innerJoin(
            incidentTypes,
            eq(incidents.incidentTypeId, incidentTypes.id),
          )
          .innerJoin(
            incidentOccurrences,
            eq(incidentOccurrences.incidentId, incidents.id),
          )
          .where(
            and(
              eq(incidents.employeeId, employeeId),
              eq(incidents.status, 'REGISTERED'),
              eq(incidentTypes.code, code),
              gte(incidentOccurrences.startDate, startDate),
              lte(incidentOccurrences.startDate, endDate),
            ),
          ),
        tx
          .select({ value: sum(employeeVacationAdjustments.daysDelta) })
          .from(employeeVacationAdjustments)
          .where(
            and(
              eq(employeeVacationAdjustments.employeeId, employeeId),
              eq(employeeVacationAdjustments.referenceYear, data.year),
              eq(employeeVacationAdjustments.period, data.period),
            ),
          ),
      ]);
      const consumed =
        Number(incidentTotalRows[0]?.value ?? 0) +
        Number(adjustmentTotalRows[0]?.value ?? 0) +
        data.daysDelta;

      if (consumed < 0 || consumed > 10) {
        return { status: 'balance-out-of-range' } as const;
      }

      await tx.insert(employeeVacationAdjustments).values({
        id: uuidToBuffer(data.id),
        employeeId,
        referenceYear: data.year,
        period: data.period,
        daysDelta: data.daysDelta,
        reason: data.reason,
        createdBy: uuidToBuffer(data.createdBy),
        createdAt: data.createdAt,
      });
      await this.auditService.append(
        {
          userId: data.createdBy,
          sessionId: data.sessionId,
          action: 'CREATED',
          entityType: 'EMPLOYEE_VACATION_ADJUSTMENT',
          entityId: data.id,
          newValues: {
            employeeId: data.employeeId,
            year: data.year,
            period: data.period,
            daysDelta: data.daysDelta,
            reason: data.reason,
          },
          createdAt: data.createdAt,
        },
        tx,
      );

      return { status: 'success' } as const;
    });

    if (result.status !== 'success') return result;

    const adjustment = await this.findAdjustmentById(data.id);
    if (!adjustment) throw new Error('Vacation adjustment persistence error');

    return { status: 'success', adjustment };
  }

  private async findActiveDates(employeeId: Buffer, codes: string[]) {
    const rows = await this.db
      .select({ code: incidentTypes.code, date: incidentOccurrences.startDate })
      .from(incidents)
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(
        incidentOccurrences,
        eq(incidentOccurrences.incidentId, incidents.id),
      )
      .where(
        and(
          eq(incidents.employeeId, employeeId),
          eq(incidents.status, 'REGISTERED'),
          inArray(incidentTypes.code, codes),
        ),
      );

    return rows;
  }

  private async findAdjustmentById(
    id: string,
  ): Promise<EmployeeVacationAdjustmentModel | null> {
    const [row] = await this.db
      .select({
        adjustment: employeeVacationAdjustments,
        actor: { id: users.id, fullName: users.fullName },
      })
      .from(employeeVacationAdjustments)
      .innerJoin(users, eq(employeeVacationAdjustments.createdBy, users.id))
      .where(eq(employeeVacationAdjustments.id, uuidToBuffer(id)))
      .limit(1);

    return row
      ? {
          id: bufferToUuid(row.adjustment.id),
          employeeId: bufferToUuid(row.adjustment.employeeId),
          year: row.adjustment.referenceYear,
          period: row.adjustment.period,
          daysDelta: row.adjustment.daysDelta,
          reason: row.adjustment.reason,
          createdBy: {
            id: bufferToUuid(row.actor.id),
            fullName: row.actor.fullName,
          },
          createdAt: row.adjustment.createdAt,
        }
      : null;
  }
}
