import { Injectable } from '@nestjs/common';

import type { IncidentsReportResponse } from '@sigip/shared';

import type { GetIncidentsReportDto } from './dto/get-incidents-report.dto';
import type {
  IncidentsReportModel,
  ReportIncidentModel,
} from './models/incidents-report.model';
import { ReportsRepository } from './repositories/reports.repository';
import { resolveReportPeriod } from './reports.dates';

@Injectable()
export class ReportsService {
  constructor(private readonly repository: ReportsRepository) {}

  async getIncidentsReport(
    filters: GetIncidentsReportDto,
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
    });

    return {
      period,
      summary: this.buildSummary(items),
      items,
    };
  }

  toResponse(report: IncidentsReportModel): IncidentsReportResponse {
    return {
      period: {
        type: report.period.type,
        startDate: toIsoDate(report.period.startDate),
        endDate: toIsoDate(report.period.endDate),
        label: report.period.label,
      },
      summary: report.summary,
      items: report.items.map((item) => ({
        incidentId: item.incidentId,
        employee: item.employee,
        organizationalUnit: item.organizationalUnit,
        position: item.position,
        incidentType: item.incidentType,
        occurrences: item.occurrences.map((occurrence) => ({
          startDate: toIsoDate(occurrence.startDate),
          endDate: occurrence.endDate ? toIsoDate(occurrence.endDate) : null,
        })),
        issuedDate: item.issuedDate ? toIsoDate(item.issuedDate) : null,
        receivedAt: item.receivedAt.toISOString(),
        status: item.status,
        observations: item.observations,
      })),
    };
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
      byType: [...byTypeMap.values()].sort((a, b) => b.count - a.count),
    };
  }
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
