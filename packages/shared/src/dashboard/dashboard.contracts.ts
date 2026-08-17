export interface DashboardSummaryResponse {
  activeEmployees: number
  absentToday: number
  absenceRate: number
  activeIncidentsToday: number
  monthIncidents: number
}

export interface DashboardOrganizationalUnitSummaryResponse {
  id: string
  name: string
}

export interface DashboardPositionSummaryResponse {
  id: string
  name: string
}

export interface DashboardIncidentTypeSummaryResponse {
  id: string
  code: string
  name: string
}

export interface DashboardActiveIncidentResponse {
  incidentId: string
  employeeId: string
  employeeNumber: string
  employeeName: string
  organizationalUnit: DashboardOrganizationalUnitSummaryResponse
  position: DashboardPositionSummaryResponse
  incidentType: DashboardIncidentTypeSummaryResponse
  occurrence: {
    startDate: string
    endDate: string | null
  }
  issuedDate: string | null
  referenceYear: number | null
}

export interface DashboardActiveIncidentsResponse {
  items: DashboardActiveIncidentResponse[]
  total: number
}

export interface DashboardIncidentTypeCountResponse {
  incidentTypeId: string
  code: string
  name: string
  count: number
}

export interface DashboardIncidentsByTypeResponse {
  items: DashboardIncidentTypeCountResponse[]
  total: number
}