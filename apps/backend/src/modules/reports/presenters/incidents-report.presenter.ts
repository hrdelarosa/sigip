import type { IncidentsReportResponse } from '@sigip/shared';
import type { IncidentsReportModel } from '../models/incidents-report.model';

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function toIncidentsReportResponse(
  report: IncidentsReportModel,
): IncidentsReportResponse {
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
