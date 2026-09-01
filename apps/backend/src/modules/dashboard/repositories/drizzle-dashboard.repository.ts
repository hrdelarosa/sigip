import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  count,
  countDistinct,
  desc,
  eq,
  gte,
  lt,
  lte,
  sql,
} from 'drizzle-orm';

import { DRIZZLE_DATABASE } from '../../../database/database.constants';
import type { DrizzleDatabase } from '../../../database/database.types';
import {
  employeeAssignments,
  employees,
  incidentOccurrences,
  incidents,
  incidentTypes,
  organizationalUnits,
  positions,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';
import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTypeCountModel,
  DashboardRecentIncidentModel,
  DashboardOperationalSummaryModel,
  DashboardUpcomingReturnModel,
} from '../models/dashboard.model';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DrizzleDashboardRepository implements DashboardRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {}

  async getSummary(
    today: Date,
    monthStart: Date,
    monthEnd: Date,
    previousMonthStart: Date,
    weekEnd: Date,
    monthStartForEmployees: Date,
    officeId?: string,
  ): Promise<DashboardOperationalSummaryModel> {
    const [
      activeEmployeesRow,
      newEmployeesRow,
      absentRow,
      activeIncidentsRow,
      endingThisWeekRow,
      monthRow,
      previousMonthRow,
    ] = await Promise.all([
      this.db
        .select({ value: countDistinct(employees.id) })
        .from(employees)
        .leftJoin(
          employeeAssignments,
          eq(employees.id, employeeAssignments.employeeId),
        )
        .where(
          and(
            eq(employees.status, 'ACTIVE'),
            officeId
              ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
              : undefined,
          ),
        ),

      this.db
        .select({ value: countDistinct(employees.id) })
        .from(employees)
        .leftJoin(
          employeeAssignments,
          eq(employees.id, employeeAssignments.employeeId),
        )
        .where(
          and(
            eq(employees.status, 'ACTIVE'),
            gte(employees.createdAt, monthStartForEmployees),
            officeId
              ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
              : undefined,
          ),
        ),

      this.db
        .select({ value: countDistinct(employees.id) })
        .from(incidents)
        .innerJoin(employees, eq(incidents.employeeId, employees.id))
        .innerJoin(
          employeeAssignments,
          eq(incidents.employeeAssignmentId, employeeAssignments.id),
        )
        .innerJoin(
          incidentOccurrences,
          eq(incidentOccurrences.incidentId, incidents.id),
        )
        .where(
          and(
            eq(employees.status, 'ACTIVE'),
            eq(incidents.status, 'REGISTERED'),
            lte(incidentOccurrences.startDate, today),
            gte(incidentOccurrences.normalizedEndDate, today),
            officeId
              ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
              : undefined,
          ),
        ),

      this.db
        .select({ value: countDistinct(incidents.id) })
        .from(incidents)
        .innerJoin(employees, eq(incidents.employeeId, employees.id))
        .innerJoin(
          employeeAssignments,
          eq(incidents.employeeAssignmentId, employeeAssignments.id),
        )
        .innerJoin(
          incidentOccurrences,
          eq(incidentOccurrences.incidentId, incidents.id),
        )
        .where(
          and(
            eq(employees.status, 'ACTIVE'),
            eq(incidents.status, 'REGISTERED'),
            gte(incidentOccurrences.normalizedEndDate, today),
            lte(incidentOccurrences.normalizedEndDate, weekEnd),
            officeId
              ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
              : undefined,
          ),
        ),

      this.db
        .select({ value: countDistinct(incidents.id) })
        .from(incidents)
        .innerJoin(employees, eq(incidents.employeeId, employees.id))
        .innerJoin(
          employeeAssignments,
          eq(incidents.employeeAssignmentId, employeeAssignments.id),
        )
        .innerJoin(
          incidentOccurrences,
          eq(incidentOccurrences.incidentId, incidents.id),
        )
        .where(
          and(
            eq(employees.status, 'ACTIVE'),
            eq(incidents.status, 'REGISTERED'),
            lte(incidentOccurrences.startDate, today),
            gte(incidentOccurrences.normalizedEndDate, today),
            officeId
              ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
              : undefined,
          ),
        ),

      this.db
        .select({ value: count() })
        .from(incidents)
        .innerJoin(
          employeeAssignments,
          eq(incidents.employeeAssignmentId, employeeAssignments.id),
        )
        .where(
          and(
            eq(incidents.status, 'REGISTERED'),
            gte(incidents.receivedAt, monthStart),
            lt(incidents.receivedAt, monthEnd),
            officeId
              ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
              : undefined,
          ),
        ),

      this.db
        .select({ value: count() })
        .from(incidents)
        .innerJoin(
          employeeAssignments,
          eq(incidents.employeeAssignmentId, employeeAssignments.id),
        )
        .where(
          and(
            eq(incidents.status, 'REGISTERED'),
            gte(incidents.receivedAt, previousMonthStart),
            lt(incidents.receivedAt, monthStart),
            officeId
              ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
              : undefined,
          ),
        ),
    ]);

    const activeEmployees = Number(activeEmployeesRow[0]?.value ?? 0);
    const absentToday = Number(absentRow[0]?.value ?? 0);
    const activeIncidentsToday = Number(activeIncidentsRow[0]?.value ?? 0);
    const previousMonthIncidents = Number(previousMonthRow[0]?.value ?? 0);
    const monthIncidents = Number(monthRow[0]?.value ?? 0);

    return {
      activeEmployees,
      newEmployeesThisMonth: Number(newEmployeesRow[0]?.value ?? 0),
      absentToday,
      absenceRate:
        activeEmployees > 0
          ? Math.round((absentToday / activeEmployees) * 1000) / 10
          : 0,
      activeIncidentsToday,
      endingThisWeek: Number(endingThisWeekRow[0]?.value ?? 0),
      monthIncidents,
      previousMonthIncidents,
      monthVariationPercentage:
        previousMonthIncidents === 0
          ? monthIncidents === 0
            ? 0
            : 100
          : Math.round(
              ((monthIncidents - previousMonthIncidents) /
                previousMonthIncidents) *
                1000,
            ) / 10,
    };
  }

  async getActiveIncidents(
    today: Date,
    officeId?: string,
  ): Promise<DashboardActiveIncidentModel[]> {
    const rows = await this.db
      .select({
        incidentId: incidents.id,
        employeeId: employees.id,
        employeeNumber: employees.employeeNumber,
        employeeName: employees.fullName,
        organizationalUnitId: organizationalUnits.id,
        organizationalUnitName: organizationalUnits.name,
        positionId: positions.id,
        positionName: positions.name,
        incidentTypeId: incidentTypes.id,
        incidentTypeCode: incidentTypes.code,
        incidentTypeName: incidentTypes.name,
        occurrenceStartDate: incidentOccurrences.startDate,
        occurrenceEndDate: incidentOccurrences.endDate,
        issuedDate: incidents.issuedDate,
        referenceYear: incidents.referenceYear,
      })
      .from(incidents)
      .innerJoin(employees, eq(incidents.employeeId, employees.id))
      .innerJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .innerJoin(
        organizationalUnits,
        eq(employeeAssignments.organizationalUnitId, organizationalUnits.id),
      )
      .innerJoin(positions, eq(employeeAssignments.positionId, positions.id))
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(
        incidentOccurrences,
        eq(incidentOccurrences.incidentId, incidents.id),
      )
      .where(
        and(
          eq(employees.status, 'ACTIVE'),
          eq(incidents.status, 'REGISTERED'),
          lte(incidentOccurrences.startDate, today),
          gte(incidentOccurrences.normalizedEndDate, today),
          officeId
            ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
            : undefined,
        ),
      )
      .orderBy(asc(incidentOccurrences.startDate), asc(employees.fullName));

    const seen = new Set<string>();
    const items: DashboardActiveIncidentModel[] = [];

    for (const row of rows) {
      const incidentId = bufferToUuid(row.incidentId);

      if (seen.has(incidentId)) continue;
      seen.add(incidentId);

      items.push({
        incidentId,
        employeeId: bufferToUuid(row.employeeId),
        employeeNumber: row.employeeNumber,
        employeeName: row.employeeName,
        organizationalUnit: {
          id: bufferToUuid(row.organizationalUnitId),
          name: row.organizationalUnitName,
        },
        position: {
          id: bufferToUuid(row.positionId),
          name: row.positionName,
        },
        incidentType: {
          id: bufferToUuid(row.incidentTypeId),
          code: row.incidentTypeCode,
          name: row.incidentTypeName,
        },
        occurrence: {
          startDate: row.occurrenceStartDate,
          endDate: row.occurrenceEndDate,
        },
        issuedDate: row.issuedDate,
        referenceYear: row.referenceYear,
      });
    }

    return items;
  }

  async getIncidentsByType(
    periodStart: Date,
    periodEnd: Date,
    officeId?: string,
  ): Promise<DashboardIncidentTypeCountModel[]> {
    const rows = await this.db
      .select({
        incidentTypeId: incidentTypes.id,
        code: incidentTypes.code,
        name: incidentTypes.name,
        count: countDistinct(incidents.id),
      })
      .from(incidents)
      .innerJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .where(
        and(
          eq(incidents.status, 'REGISTERED'),
          gte(incidents.receivedAt, periodStart),
          lt(incidents.receivedAt, periodEnd),
          officeId
            ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
            : undefined,
        ),
      )
      .groupBy(incidentTypes.id, incidentTypes.code, incidentTypes.name)
      .orderBy(desc(countDistinct(incidents.id)));

    const total = rows.reduce((sum, row) => sum + Number(row.count), 0);

    return rows.map((row) => ({
      incidentTypeId: bufferToUuid(row.incidentTypeId),
      code: row.code,
      name: row.name,
      count: Number(row.count),
      percentage:
        total > 0 ? Math.round((Number(row.count) / total) * 1000) / 10 : 0,
    }));
  }

  async getIncidentTrend(
    periodStart: Date,
    periodEnd: Date,
    officeId?: string,
  ): Promise<Array<{ period: string; count: number }>> {
    const period = sql<string>`DATE_FORMAT(${incidents.receivedAt}, '%Y-%m')`;
    const rows = await this.db
      .select({ period, count: countDistinct(incidents.id) })
      .from(incidents)
      .innerJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .where(
        and(
          eq(incidents.status, 'REGISTERED'),
          gte(incidents.receivedAt, periodStart),
          lt(incidents.receivedAt, periodEnd),
          officeId
            ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
            : undefined,
        ),
      )
      .groupBy(period)
      .orderBy(period);

    return rows.map((row) => ({
      period: row.period,
      count: Number(row.count),
    }));
  }

  async getUpcomingReturns(
    today: Date,
    weekEnd: Date,
    officeId?: string,
  ): Promise<DashboardUpcomingReturnModel[]> {
    const rows = await this.db
      .select({
        incidentId: incidents.id,
        employeeId: employees.id,
        employeeNumber: employees.employeeNumber,
        employeeName: employees.fullName,
        organizationalUnitId: organizationalUnits.id,
        organizationalUnitName: organizationalUnits.name,
        incidentTypeId: incidentTypes.id,
        incidentTypeCode: incidentTypes.code,
        incidentTypeName: incidentTypes.name,
        occurrenceEndDate: incidentOccurrences.endDate,
        normalizedEndDate: incidentOccurrences.normalizedEndDate,
      })
      .from(incidents)
      .innerJoin(employees, eq(incidents.employeeId, employees.id))
      .innerJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .innerJoin(
        organizationalUnits,
        eq(employeeAssignments.organizationalUnitId, organizationalUnits.id),
      )
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(
        incidentOccurrences,
        eq(incidentOccurrences.incidentId, incidents.id),
      )
      .where(
        and(
          eq(employees.status, 'ACTIVE'),
          eq(incidents.status, 'REGISTERED'),
          gte(incidentOccurrences.normalizedEndDate, today),
          lte(incidentOccurrences.normalizedEndDate, weekEnd),
          officeId
            ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
            : undefined,
        ),
      )
      .orderBy(
        asc(incidentOccurrences.normalizedEndDate),
        asc(employees.fullName),
      );

    const seen = new Set<string>();
    return rows
      .flatMap((row) => {
        const incidentId = bufferToUuid(row.incidentId);
        if (seen.has(incidentId)) return [];
        seen.add(incidentId);
        const returnDate = row.normalizedEndDate;
        return [
          {
            incidentId,
            employee: {
              id: bufferToUuid(row.employeeId),
              employeeNumber: row.employeeNumber,
              name: row.employeeName,
            },
            organizationalUnit: {
              id: bufferToUuid(row.organizationalUnitId),
              name: row.organizationalUnitName,
            },
            incidentType: {
              id: bufferToUuid(row.incidentTypeId),
              code: row.incidentTypeCode,
              name: row.incidentTypeName,
            },
            endDate: row.occurrenceEndDate ?? returnDate,
            returnDate,
            daysRemaining: Math.round(
              (returnDate.getTime() - today.getTime()) / 86_400_000,
            ),
          },
        ];
      })
      .slice(0, 5);
  }

  async getRecentIncidents(
    limit: number,
    officeId?: string,
  ): Promise<DashboardRecentIncidentModel[]> {
    const rows = await this.db
      .select({
        incidentId: incidents.id,
        employeeId: employees.id,
        employeeNumber: employees.employeeNumber,
        employeeName: employees.fullName,
        organizationalUnitId: organizationalUnits.id,
        organizationalUnitName: organizationalUnits.name,
        incidentTypeId: incidentTypes.id,
        incidentTypeName: incidentTypes.name,
        occurrenceStartDate: incidentOccurrences.startDate,
        occurrenceEndDate: incidentOccurrences.endDate,
        receivedAt: incidents.receivedAt,
        status: incidents.status,
      })
      .from(incidents)
      .innerJoin(employees, eq(incidents.employeeId, employees.id))
      .innerJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .innerJoin(
        organizationalUnits,
        eq(employeeAssignments.organizationalUnitId, organizationalUnits.id),
      )
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(
        incidentOccurrences,
        eq(incidentOccurrences.incidentId, incidents.id),
      )
      .where(
        officeId
          ? eq(employeeAssignments.officeId, uuidToBuffer(officeId))
          : undefined,
      )
      .orderBy(desc(incidents.receivedAt), asc(incidentOccurrences.startDate))
      .limit(limit * 2);

    const seen = new Set<string>();
    return rows
      .flatMap((row) => {
        const incidentId = bufferToUuid(row.incidentId);
        if (seen.has(incidentId)) return [];
        seen.add(incidentId);
        return [
          {
            incidentId,
            employee: {
              id: bufferToUuid(row.employeeId),
              employeeNumber: row.employeeNumber,
              name: row.employeeName,
            },
            organizationalUnit: {
              id: bufferToUuid(row.organizationalUnitId),
              name: row.organizationalUnitName,
            },
            incidentType: {
              id: bufferToUuid(row.incidentTypeId),
              name: row.incidentTypeName,
            },
            occurrence: {
              startDate: row.occurrenceStartDate,
              endDate: row.occurrenceEndDate,
            },
            receivedAt: row.receivedAt,
            status: row.status,
          },
        ];
      })
      .slice(0, limit);
  }
}
