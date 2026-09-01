import { Injectable } from '@nestjs/common';

import type { IncidentsReportResponse } from '@sigip/shared';

import type { GetIncidentsReportDto } from './dto/get-incidents-report.dto';
import type {
  IncidentsReportModel,
  ReportIncidentModel,
} from './models/incidents-report.model';
import { ReportsRepository } from './repositories/reports.repository';
import { resolveReportPeriod } from './reports.dates';
import { toIncidentsReportResponse } from './presenters/incidents-report.presenter';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { getOfficeScope } from '../../common/authorization/office-scope';

@Injectable()
export class ReportsService {
  constructor(private readonly repository: ReportsRepository) {}

  async getIncidentsReport(
    filters: GetIncidentsReportDto,
    actor: AuthenticatedUserModel,
  ): Promise<IncidentsReportModel> {
    const period = resolveReportPeriod({
      period: filters.period,
      fortnight: filters.fortnight,
      month: filters.month,
      year: filters.year,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    const items = await this.repository.findIncidents({
      startDate: period.startDate,
      endDate: period.endDate,
      incidentTypeId: filters.incidentTypeId,
      organizationalUnitId: filters.organizationalUnitId,
      includeCancelled: filters.includeCancelled ?? false,
      officeId: getOfficeScope(actor).canAccessAllOffices
        ? undefined
        : actor.office.id,
    });

    return {
      period,
      filters: {
        incidentTypeId: filters.incidentTypeId,
        organizationalUnitId: filters.organizationalUnitId,
        includeCancelled: filters.includeCancelled ?? false,
      },
      summary: this.buildSummary(items),
      items,
    };
  }

  toResponse(report: IncidentsReportModel): IncidentsReportResponse {
    return toIncidentsReportResponse(report);
  }

  private buildSummary(
    items: ReportIncidentModel[],
  ): IncidentsReportModel['summary'] {
    const employees = new Set<string>();
    const byTypeMap = new Map<
      string,
      {
        incidentTypeId: string;
        code: string;
        name: string;
        count: number;
      }
    >();

    let registeredIncidents = 0;
    let cancelledIncidents = 0;

    for (const item of items) {
      employees.add(item.employee.id);

      if (item.status === 'REGISTERED') registeredIncidents++;
      else cancelledIncidents++;

      const current = byTypeMap.get(item.incidentType.id);

      if (current) current.count++;
      else {
        byTypeMap.set(item.incidentType.id, {
          incidentTypeId: item.incidentType.id,
          code: item.incidentType.code,
          name: item.incidentType.name,
          count: 1,
        });
      }
    }

    return {
      totalIncidents: items.length,
      totalEmployees: employees.size,
      registeredIncidents,
      cancelledIncidents,
      averageIncidentsPerEmployee:
        employees.size > 0
          ? Math.round((items.length / employees.size) * 10) / 10
          : 0,
      byType: [...byTypeMap.values()]
        .map((item) => ({
          ...item,
          percentage:
            items.length > 0
              ? Math.round((item.count / items.length) * 1000) / 10
              : 0,
        }))
        .sort((a, b) => b.count - a.count),
      byOrganizationalUnit: buildUnitSummary(items),
    };
  }
}

function buildUnitSummary(items: ReportIncidentModel[]) {
  const byUnit = new Map<
    string,
    { organizationalUnitId: string; name: string; count: number }
  >();

  for (const item of items) {
    const current = byUnit.get(item.organizationalUnit.id);
    if (current) current.count++;
    else {
      byUnit.set(item.organizationalUnit.id, {
        organizationalUnitId: item.organizationalUnit.id,
        name: item.organizationalUnit.name,
        count: 1,
      });
    }
  }

  return [...byUnit.values()]
    .map((item) => ({
      ...item,
      percentage:
        items.length > 0
          ? Math.round((item.count / items.length) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.count - a.count);
}
