import type { IncidentResponse } from '@sigip/shared';
import type { IncidentDetailsModel } from '../models/incident.model';

function formatDate(value: Date | null): string | null {
  return value ? value.toISOString().slice(0, 10) : null;
}

export function toIncidentResponse(
  model: IncidentDetailsModel,
): IncidentResponse {
  return {
    id: model.id,
    employeeId: model.employeeId,
    employeeAssignmentId: model.employeeAssignmentId,
    incidentTypeId: model.incidentTypeId,
    employee: model.employee,
    assignment: {
      id: model.assignment.id,
      appointmentType: model.assignment.appointmentType,
      schedule: model.assignment.schedule,
      effectiveFrom: formatDate(model.assignment.effectiveFrom)!,
      effectiveTo: formatDate(model.assignment.effectiveTo),
      organizationalUnit: model.assignment.organizationalUnit,
      position: model.assignment.position,
    },
    incidentType: model.incidentType,
    issuedDate: formatDate(model.issuedDate),
    receivedAt: model.receivedAt.toISOString(),
    referenceYear: model.referenceYear,
    observations: model.observations,
    status: model.status,
    occurrences: model.occurrences.map((occurrence) => ({
      id: occurrence.id,
      startDate: formatDate(occurrence.startDate)!,
      endDate: formatDate(occurrence.endDate),
    })),
    registeredBy: model.registeredByUser,
    cancelledAt: model.cancelledAt?.toISOString() ?? null,
    cancellationReason: model.cancellationReason,
    createdAt: model.createdAt.toISOString(),
    updatedAt: model.updatedAt.toISOString(),
  };
}
