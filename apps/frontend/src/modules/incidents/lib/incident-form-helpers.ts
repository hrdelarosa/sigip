import { format } from 'date-fns'

import type {
  CreateIncidentInput,
  Incident,
  UpdateIncidentInput,
} from '../types/incident.types'
import type { IncidentFormValues } from '../schemas/incident-form.schema'

export function getIncidentFormDefaultValues(
  incident?: Incident,
): IncidentFormValues {
  if (!incident) {
    return {
      employeeId: '',
      employeeAssignmentId: '',
      incidentTypeId: '',
      incidentTypeCode: '',
      temporalMode: 'SINGLE_DATE',
      assignmentEffectiveFrom: '',
      assignmentEffectiveTo: null,
      issuedDate: null,
      receivedAt: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      referenceYear: String(new Date().getFullYear()),
      observations: '',
      occurrences: [{ startDate: '', endDate: null }],
      file: null,
      commissionAnnex: null,
    }
  }

  return {
    employeeId: incident.employeeId,
    employeeAssignmentId: incident.employeeAssignmentId,
    incidentTypeId: incident.incidentTypeId,
    incidentTypeCode: incident.incidentType.code,
    temporalMode: incident.incidentType.temporalMode,
    assignmentEffectiveFrom: incident.assignment.effectiveFrom,
    assignmentEffectiveTo: incident.assignment.effectiveTo,
    issuedDate: incident.issuedDate,
    receivedAt: format(new Date(incident.receivedAt), "yyyy-MM-dd'T'HH:mm"),
    referenceYear: incident.referenceYear ? String(incident.referenceYear) : '',
    observations: incident.observations ?? '',
    occurrences: incident.occurrences.map((occurrence) => ({
      startDate: occurrence.startDate,
      endDate: occurrence.endDate,
    })),
    file: null,
    commissionAnnex: null,
  }
}

export function toIncidentCreateRequest(
  values: IncidentFormValues,
): CreateIncidentInput {
  return {
    employeeId: values.employeeId,
    employeeAssignmentId: values.employeeAssignmentId,
    incidentTypeId: values.incidentTypeId,
    issuedDate: values.issuedDate || null,
    receivedAt: new Date(values.receivedAt).toISOString(),
    referenceYear: values.referenceYear ? Number(values.referenceYear) : null,
    observations: values.observations.trim() || null,
    occurrences: values.occurrences.map((occurrence) => ({
      startDate: occurrence.startDate,
      endDate: occurrence.endDate || null,
    })),
  }
}

export function toIncidentUpdateRequest(
  values: IncidentFormValues,
): UpdateIncidentInput {
  const request = toIncidentCreateRequest(values)

  return {
    incidentTypeId: request.incidentTypeId,
    issuedDate: request.issuedDate,
    receivedAt: request.receivedAt,
    referenceYear: request.referenceYear,
    observations: request.observations,
    occurrences: request.occurrences,
  }
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Intente nuevamente.'
}