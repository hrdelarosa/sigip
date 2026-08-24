export const REPORT_PERIOD_TYPES = [
  'FORTNIGHT',
  'MONTH',
  'YEAR',
  'CUSTOM',
] as const

export type ReportPeriodType = (typeof REPORT_PERIOD_TYPES)[number]

export const REPORT_FORTNIGHT_OPTIONS = ['FIRST', 'SECOND'] as const

export type ReportFortnightOption = (typeof REPORT_FORTNIGHT_OPTIONS)[number]

export interface ReportPeriod {
  type: ReportPeriodType
  startDate: string
  endDate: string
  label: string
}

export interface IncidentsReportFilters {
  period: ReportPeriodType
  /** Quincena dentro del mes para el periodo FORTNIGHT: FIRST (1-15) o SECOND (16 al fin de mes). */
  fortnight?: ReportFortnightOption
  /** Mes (1-12) para los periodos FORTNIGHT y MONTH. */
  month?: number
  /** Año para los periodos FORTNIGHT, MONTH y YEAR. */
  year?: number
  startDate?: string
  endDate?: string
  incidentTypeId?: string
  organizationalUnitId?: string
  includeCancelled?: boolean
}

export interface IncidentsReportOccurrenceResponse {
  startDate: string
  endDate: string | null
}

export interface IncidentsReportItemResponse {
  incidentId: string

  employee: {
    id: string
    employeeNumber: string
    fullName: string
  }

  organizationalUnit: {
    id: string
    name: string
  }

  position: {
    id: string
    name: string
  }

  incidentType: {
    id: string
    code: string
    name: string
  }

  occurrences: IncidentsReportOccurrenceResponse[]

  issuedDate: string | null
  receivedAt: string
  status: 'REGISTERED' | 'CANCELLED'
  observations: string | null
}

export interface IncidentsReportTypeSummaryResponse {
  incidentTypeId: string
  code: string
  name: string
  count: number
  percentage: number
}

export interface IncidentsReportOrganizationalUnitSummaryResponse {
  organizationalUnitId: string
  name: string
  count: number
  percentage: number
}

export interface IncidentsReportResponse {
  period: ReportPeriod

  summary: {
    totalIncidents: number
    totalEmployees: number
    registeredIncidents: number
    cancelledIncidents: number
    averageIncidentsPerEmployee: number
    byType: IncidentsReportTypeSummaryResponse[]
    byOrganizationalUnit: IncidentsReportOrganizationalUnitSummaryResponse[]
  }

  items: IncidentsReportItemResponse[]
}
