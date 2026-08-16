import type { PaginatedResponse } from '../common/pagination.contracts'

export const INCIDENT_TEMPORAL_MODES = [
  'SINGLE_DATE',
  'MULTIPLE_DATES',
  'DATE_RANGE',
] as const

export type IncidentTemporalMode = (typeof INCIDENT_TEMPORAL_MODES)[number]

export const INCIDENT_APPOINTMENT_SCOPES = ['ALL', 'BASE', 'CONFIANZA'] as const

export type IncidentAppointmentScope =
  (typeof INCIDENT_APPOINTMENT_SCOPES)[number]

export interface IncidentTypeResponse {
  id: string
  code: string
  name: string
  description: string | null
  temporalMode: IncidentTemporalMode
  appointmentScope: IncidentAppointmentScope
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type IncidentTypesResponse = PaginatedResponse<IncidentTypeResponse>

export interface CreateIncidentTypeRequest {
  code: string
  name: string
  description?: string | null
  temporalMode: IncidentTemporalMode
  appointmentScope: IncidentAppointmentScope
  sortOrder?: number
}

export interface UpdateIncidentTypeRequest {
  name?: string
  description?: string | null
  temporalMode?: IncidentTemporalMode
  appointmentScope?: IncidentAppointmentScope
  sortOrder?: number
}

export interface UpdateIncidentTypeStatusRequest {
  isActive: boolean
}
