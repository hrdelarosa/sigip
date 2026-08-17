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
import { bufferToUuid } from '../../../database/utils/uuid.util';
import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTypeCountModel,
  DashboardSummaryModel,
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
  ): Promise<DashboardSummaryModel> {
    const [activeEmployeesRow, absentRow, activeIncidentsRow, monthRow] =
      await Promise.all([
        this.db
          .select({ value: count() })
          .from(employees)
          .where(eq(employees.status, 'ACTIVE')),

        this.db
          .select({ value: countDistinct(employees.id) })
          .from(incidents)
          .innerJoin(employees, eq(incidents.employeeId, employees.id))
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
            ),
          ),

        this.db
          .select({ value: countDistinct(incidents.id) })
          .from(incidents)
          .innerJoin(employees, eq(incidents.employeeId, employees.id))
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
            ),
          ),

        this.db
          .select({ value: count() })
          .from(incidents)
          .where(
            and(
              eq(incidents.status, 'REGISTERED'),
              gte(incidents.receivedAt, monthStart),
              lt(incidents.receivedAt, monthEnd),
            ),
          ),
      ]);

    const activeEmployees = Number(activeEmployeesRow[0]?.value ?? 0);
    const absentToday = Number(absentRow[0]?.value ?? 0);
    const activeIncidentsToday = Number(activeIncidentsRow[0]?.value ?? 0);
    const monthIncidents = Number(monthRow[0]?.value ?? 0);

    return {
      activeEmployees,
      absentToday,
      absenceRate:
        activeEmployees > 0
          ? Math.round((absentToday / activeEmployees) * 1000) / 10
          : 0,
      activeIncidentsToday,
      monthIncidents,
    };
  }

  async getActiveIncidents(today: Date): Promise<DashboardActiveIncidentModel[]> {
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
    yearStart: Date,
    yearEnd: Date,
  ): Promise<DashboardIncidentTypeCountModel[]> {
    const rows = await this.db
      .select({
        incidentTypeId: incidentTypes.id,
        code: incidentTypes.code,
        name: incidentTypes.name,
        count: countDistinct(incidents.id),
      })
      .from(incidents)
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .where(
        and(
          eq(incidents.status, 'REGISTERED'),
          gte(incidents.receivedAt, yearStart),
          lt(incidents.receivedAt, yearEnd),
        ),
      )
      .groupBy(incidentTypes.id, incidentTypes.code, incidentTypes.name)
      .orderBy(desc(countDistinct(incidents.id)));

    return rows.map((row) => ({
      incidentTypeId: bufferToUuid(row.incidentTypeId),
      code: row.code,
      name: row.name,
      count: Number(row.count),
    }));
  }
}