import type { PaginatedResponse } from '../common/pagination.contracts'
import type {
  IncidentAppointmentScope,
  IncidentTemporalMode,
} from '../incident-types'

export const INCIDENT_STATUSES = ['REGISTERED', 'CANCELLED'] as const

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number]

export interface IncidentOccurrenceRequest {
  startDate: string
  endDate?: string | null
}

export interface IncidentOccurrenceResponse {
  id: string
  startDate: string
  endDate: string | null
}

export interface CreateIncidentRequest {
  employeeId: string
  employeeAssignmentId?: string | null
  incidentTypeId: string
  issuedDate?: string | null
  receivedAt: string
  referenceYear?: number | null
  observations?: string | null
  occurrences: IncidentOccurrenceRequest[]
}

export interface UpdateIncidentRequest {
  incidentTypeId?: string
  issuedDate?: string | null
  receivedAt?: string
  referenceYear?: number | null
  observations?: string | null
  occurrences?: IncidentOccurrenceRequest[]
}

export interface CancelIncidentRequest {
  reason: string
}

export interface IncidentEmployeeResponse {
  id: string
  employeeNumber: string
  fullName: string
}

export interface IncidentOrganizationalUnitResponse {
  id: string
  code: string
  name: string
}

export interface IncidentPositionResponse {
  id: string
  code: string
  name: string
}

export interface IncidentAssignmentResponse {
  id: string
  appointmentType: string
  schedule: string | null
  effectiveFrom: string
  effectiveTo: string | null
  organizationalUnit: IncidentOrganizationalUnitResponse | null
  position: IncidentPositionResponse
}

export interface IncidentTypeSummaryResponse {
  id: string
  code: string
  name: string
  temporalMode: IncidentTemporalMode
  appointmentScope: IncidentAppointmentScope
}

export interface IncidentRegisteredByResponse {
  id: string
  username: string
  fullName: string
}

export interface IncidentResponse {
  id: string
  employeeId: string
  employeeAssignmentId: string | null
  incidentTypeId: string
  employee: IncidentEmployeeResponse
  assignment: IncidentAssignmentResponse | null
  incidentType: IncidentTypeSummaryResponse
  issuedDate: string | null
  receivedAt: string
  referenceYear: number | null
  observations: string | null
  status: IncidentStatus
  occurrences: IncidentOccurrenceResponse[]
  registeredBy: IncidentRegisteredByResponse
  cancelledAt: string | null
  cancellationReason: string | null
  createdAt: string
  updatedAt: string
}

export type IncidentsResponse = PaginatedResponse<IncidentResponse>
