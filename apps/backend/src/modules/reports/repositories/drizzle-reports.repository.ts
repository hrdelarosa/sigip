import { Inject, Injectable } from '@nestjs/common';
import {
  and,
  asc,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  or,
  type SQL,
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
  employeeVacationAdjustments,
  offices,
} from '../../../database/schema';
import { bufferToUuid, uuidToBuffer } from '../../../database/utils/uuid.util';

import type { ReportIncidentModel } from '../models/incidents-report.model';
import type {
  VacationReportAdjustmentRecord,
  VacationReportEmployeeRecord,
  VacationReportIncidentRecord,
} from '../models/vacations-report.model';
import {
  ReportsRepository,
  type FindIncidentReportOptions,
} from './reports.repository';
import { ReportLimitExceededError } from '../reports.errors';

const MAX_REPORT_ROWS = 5_000;

@Injectable()
export class DrizzleReportsRepository extends ReportsRepository {
  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: DrizzleDatabase,
  ) {
    super();
  }

  async findIncidents(
    options: FindIncidentReportOptions,
  ): Promise<ReportIncidentModel[]> {
    const conditions: SQL[] = [
      lte(incidentOccurrences.startDate, options.endDate),
      gte(incidentOccurrences.normalizedEndDate, options.startDate),
    ];

    if (!options.includeCancelled) {
      conditions.push(eq(incidents.status, 'REGISTERED'));
    } else {
      conditions.push(inArray(incidents.status, ['REGISTERED', 'CANCELLED']));
    }

    if (options.incidentTypeId) {
      conditions.push(
        eq(incidents.incidentTypeId, uuidToBuffer(options.incidentTypeId)),
      );
    }

    if (options.organizationalUnitId) {
      conditions.push(
        eq(
          employeeAssignments.organizationalUnitId,
          uuidToBuffer(options.organizationalUnitId),
        ),
      );
    }

    if (options.officeId) {
      conditions.push(eq(employees.officeId, uuidToBuffer(options.officeId)));
    }

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
        receivedAt: incidents.receivedAt,
        status: incidents.status,
        observations: incidents.observations,
      })
      .from(incidents)
      .innerJoin(employees, eq(incidents.employeeId, employees.id))
      .leftJoin(
        employeeAssignments,
        eq(incidents.employeeAssignmentId, employeeAssignments.id),
      )
      .leftJoin(
        organizationalUnits,
        eq(employeeAssignments.organizationalUnitId, organizationalUnits.id),
      )
      .leftJoin(positions, eq(employeeAssignments.positionId, positions.id))
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(
        incidentOccurrences,
        eq(incidentOccurrences.incidentId, incidents.id),
      )
      .where(and(...conditions))
      .orderBy(asc(employees.fullName), asc(incidentOccurrences.startDate))
      .limit(MAX_REPORT_ROWS + 1);

    if (rows.length > MAX_REPORT_ROWS) {
      throw new ReportLimitExceededError(MAX_REPORT_ROWS);
    }

    const incidentsMap = new Map<string, ReportIncidentModel>();

    for (const row of rows) {
      const incidentId = bufferToUuid(row.incidentId);

      let incident = incidentsMap.get(incidentId);

      if (!incident) {
        incident = {
          incidentId,
          employee: {
            id: bufferToUuid(row.employeeId),
            employeeNumber: row.employeeNumber,
            fullName: row.employeeName,
          },
          organizationalUnit:
            row.organizationalUnitId && row.organizationalUnitName
              ? {
                  id: bufferToUuid(row.organizationalUnitId),
                  name: row.organizationalUnitName,
                }
              : null,
          position:
            row.positionId && row.positionName
              ? {
                  id: bufferToUuid(row.positionId),
                  name: row.positionName,
                }
              : null,
          incidentType: {
            id: bufferToUuid(row.incidentTypeId),
            code: row.incidentTypeCode,
            name: row.incidentTypeName,
          },
          occurrences: [],
          issuedDate: row.issuedDate,
          receivedAt: row.receivedAt,
          status: row.status,
          observations: row.observations,
        };

        incidentsMap.set(incidentId, incident);
      }

      incident.occurrences.push({
        startDate: row.occurrenceStartDate,
        endDate: row.occurrenceEndDate,
      });
    }

    return [...incidentsMap.values()];
  }

  async findVacationEmployees(
    officeId?: string,
  ): Promise<VacationReportEmployeeRecord[]> {
    const rows = await this.db
      .select({
        id: employees.id,
        employeeNumber: employees.employeeNumber,
        fullName: employees.fullName,
        officeId: offices.id,
        officeName: offices.name,
        hireDate: employees.hireDate,
      })
      .from(employees)
      .innerJoin(offices, eq(employees.officeId, offices.id))
      .where(
        and(
          eq(employees.status, 'ACTIVE'),
          officeId ? eq(employees.officeId, uuidToBuffer(officeId)) : undefined,
        ),
      )
      .orderBy(asc(employees.fullName))
      .limit(MAX_REPORT_ROWS + 1);

    if (rows.length > MAX_REPORT_ROWS) {
      throw new ReportLimitExceededError(MAX_REPORT_ROWS);
    }

    return rows.map((row) => ({
      id: bufferToUuid(row.id),
      employeeNumber: row.employeeNumber,
      fullName: row.fullName,
      officeId: bufferToUuid(row.officeId),
      officeName: row.officeName,
      hireDate: row.hireDate,
    }));
  }

  async findVacationIncidents(
    employeeIds: string[],
    year: number,
    officeId?: string,
  ): Promise<VacationReportIncidentRecord[]> {
    if (employeeIds.length === 0) return [];
    const rows = await this.db
      .select({
        employeeId: incidents.employeeId,
        code: incidentTypes.code,
        referenceYear: incidents.referenceYear,
        date: incidentOccurrences.startDate,
      })
      .from(incidents)
      .innerJoin(employees, eq(incidents.employeeId, employees.id))
      .innerJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .innerJoin(
        incidentOccurrences,
        eq(incidentOccurrences.incidentId, incidents.id),
      )
      .where(
        and(
          inArray(incidents.employeeId, employeeIds.map(uuidToBuffer)),
          eq(incidents.status, 'REGISTERED'),
          inArray(incidentTypes.code, [
            'VACACIONES_PRIMER_PERIODO',
            'VACACIONES_SEGUNDO_PERIODO',
          ]),
          or(
            eq(incidents.referenceYear, year),
            and(
              isNull(incidents.referenceYear),
              gte(
                incidentOccurrences.startDate,
                new Date(Date.UTC(year, 3, 1)),
              ),
              lte(
                incidentOccurrences.startDate,
                new Date(Date.UTC(year + 1, 2, 31)),
              ),
            ),
          ),
          officeId ? eq(employees.officeId, uuidToBuffer(officeId)) : undefined,
        ),
      )
      .limit(50_001);

    if (rows.length > 50_000) {
      throw new ReportLimitExceededError(50_000);
    }

    return rows.map((row) => ({
      employeeId: bufferToUuid(row.employeeId),
      code: row.code,
      referenceYear: row.referenceYear,
      date: row.date,
    }));
  }

  async findVacationAdjustments(
    employeeIds: string[],
    year: number,
  ): Promise<VacationReportAdjustmentRecord[]> {
    if (employeeIds.length === 0) return [];
    const rows = await this.db
      .select({
        employeeId: employeeVacationAdjustments.employeeId,
        year: employeeVacationAdjustments.referenceYear,
        period: employeeVacationAdjustments.period,
        daysDelta: employeeVacationAdjustments.daysDelta,
      })
      .from(employeeVacationAdjustments)
      .where(
        and(
          inArray(
            employeeVacationAdjustments.employeeId,
            employeeIds.map(uuidToBuffer),
          ),
          eq(employeeVacationAdjustments.referenceYear, year),
        ),
      );

    return rows.map((row) => ({
      employeeId: bufferToUuid(row.employeeId),
      year: row.year,
      period: row.period,
      daysDelta: row.daysDelta,
    }));
  }
}
