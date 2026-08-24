export interface DashboardSummaryResponse {
  activeEmployees: number
  newEmployeesThisMonth: number
  absentToday: number
  absenceRate: number
  activeIncidentsToday: number
  endingThisWeek: number
  monthIncidents: number
  previousMonthIncidents: number
  monthVariationPercentage: number
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
  percentage: number
}

export interface DashboardIncidentsByTypeResponse {
  items: DashboardIncidentTypeCountResponse[]
  total: number
}

export interface DashboardIncidentTrendResponse {
  items: Array<{
    period: string
    label: string
    count: number
  }>
}

export interface DashboardUpcomingReturnResponse {
  incidentId: string
  employee: {
    id: string
    employeeNumber: string
    name: string
  }
  organizationalUnit: {
    id: string
    name: string
  }
  incidentType: {
    id: string
    code: string
    name: string
  }
  endDate: string
  returnDate: string
  daysRemaining: number
}

export interface DashboardUpcomingReturnsResponse {
  items: DashboardUpcomingReturnResponse[]
  total: number
}

export interface DashboardRecentIncidentResponse {
  incidentId: string
  employee: {
    id: string
    employeeNumber: string
    name: string
  }
  organizationalUnit: {
    id: string
    name: string
  }
  incidentType: {
    id: string
    name: string
  }
  occurrence: {
    startDate: string
    endDate: string | null
  }
  receivedAt: string
  status: string
}

export interface DashboardRecentIncidentsResponse {
  items: DashboardRecentIncidentResponse[]
  total: number
}
