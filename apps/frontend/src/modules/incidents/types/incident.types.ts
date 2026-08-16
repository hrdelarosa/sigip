import type {
  CancelIncidentRequest,
  CreateIncidentRequest,
  IncidentResponse,
  IncidentStatus,
  IncidentTypeResponse,
  IncidentTypesResponse,
  IncidentDocumentsResponse,
  IncidentsResponse,
  UpdateIncidentRequest,
} from '@sigip/shared'

export type Incident = IncidentResponse

export type Incidents = IncidentsResponse

export type CreateIncidentInput = CreateIncidentRequest

export type UpdateIncidentInput = UpdateIncidentRequest

export type CancelIncidentInput = CancelIncidentRequest
export type IncidentType = IncidentTypeResponse
export type IncidentTypes = IncidentTypesResponse
export type IncidentDocuments = IncidentDocumentsResponse

export interface IncidentListParams {
  page?: number
  limit?: number

  search?: string

  status?: IncidentStatus

  employeeId?: string
  incidentTypeId?: string
  organizationalUnitId?: string

  from?: string
  to?: string

}

export interface IncidentTypeListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
