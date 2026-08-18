import type {
  DashboardActiveIncidentResponse,
  DashboardIncidentTypeCountResponse,
  DashboardSummaryResponse,
} from '@sigip/shared';
import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTypeCountModel,
  DashboardSummaryModel,
} from '../models/dashboard.model';

function formatDate(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

export function toDashboardSummaryResponse(
  model: DashboardSummaryModel,
): DashboardSummaryResponse {
  return {
    activeEmployees: model.activeEmployees,
    absentToday: model.absentToday,
    absenceRate: model.absenceRate,
    activeIncidentsToday: model.activeIncidentsToday,
    monthIncidents: model.monthIncidents,
  };
}

export function toDashboardActiveIncidentResponse(
  model: DashboardActiveIncidentModel,
): DashboardActiveIncidentResponse {
  return {
    incidentId: model.incidentId,
    employeeId: model.employeeId,
    employeeNumber: model.employeeNumber,
    employeeName: model.employeeName,
    organizationalUnit: model.organizationalUnit,
    position: model.position,
    incidentType: model.incidentType,
    occurrence: {
      startDate: formatDate(model.occurrence.startDate)!,
      endDate: formatDate(model.occurrence.endDate),
    },
    issuedDate: formatDate(model.issuedDate),
    referenceYear: model.referenceYear,
  };
}

export function toDashboardIncidentTypeCountResponse(
  model: DashboardIncidentTypeCountModel,
): DashboardIncidentTypeCountResponse {
  return {
    incidentTypeId: model.incidentTypeId,
    code: model.code,
    name: model.name,
    count: model.count,
  };
}
