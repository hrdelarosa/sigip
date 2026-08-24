import type {
  DashboardActiveIncidentResponse,
  DashboardIncidentTypeCountResponse,
  DashboardRecentIncidentResponse,
  DashboardSummaryResponse,
  DashboardUpcomingReturnResponse,
} from '@sigip/shared';
import type {
  DashboardActiveIncidentModel,
  DashboardIncidentTrendModel,
  DashboardIncidentTypeCountModel,
  DashboardRecentIncidentModel,
  DashboardSummaryModel,
  DashboardUpcomingReturnModel,
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
    newEmployeesThisMonth: model.newEmployeesThisMonth,
    endingThisWeek: model.endingThisWeek,
    previousMonthIncidents: model.previousMonthIncidents,
    monthVariationPercentage: model.monthVariationPercentage,
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
    percentage: model.percentage,
  };
}

export function toDashboardIncidentTrendResponse(
  model: DashboardIncidentTrendModel,
) {
  return model;
}

export function toDashboardUpcomingReturnResponse(
  model: DashboardUpcomingReturnModel,
): DashboardUpcomingReturnResponse {
  return {
    ...model,
    endDate: formatDate(model.endDate)!,
    returnDate: formatDate(model.returnDate)!,
  };
}

export function toDashboardRecentIncidentResponse(
  model: DashboardRecentIncidentModel,
): DashboardRecentIncidentResponse {
  return {
    ...model,
    occurrence: {
      startDate: formatDate(model.occurrence.startDate)!,
      endDate: formatDate(model.occurrence.endDate),
    },
    receivedAt: model.receivedAt.toISOString(),
  };
}
