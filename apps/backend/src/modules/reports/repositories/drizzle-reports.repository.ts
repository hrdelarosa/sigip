import { Inject, Injectable } from '@nestjs/common';
import { and, asc, eq, gte, inArray, lte, type SQL } from 'drizzle-orm';

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

import type { ReportIncidentModel } from '../models/incidents-report.model';
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
}
