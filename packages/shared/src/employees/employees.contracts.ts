import type { PaginatedResponse } from '../common/pagination.contracts'

export const EMPLOYEE_STATUSES = ['ACTIVE', 'INACTIVE'] as const
export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number]

export const APPOINTMENT_TYPES = ['BASE', 'CONFIANZA'] as const
export type AppointmentType = (typeof APPOINTMENT_TYPES)[number]

export interface EmployeeResponse {
  id: string
  employeeNumber: string
  fullName: string
  hireDate: string | null
  status: EmployeeStatus
  createdAt: string
  updatedAt: string
}

export type EmployeesResponse = PaginatedResponse<EmployeeResponse>

export interface CreateEmployeeRequest {
  employeeNumber: string
  fullName: string
  hireDate?: string | null
}

export interface UpdateEmployeeRequest {
  employeeNumber?: string
  fullName?: string
  hireDate?: string | null
}

export interface UpdateEmployeeStatusRequest {
  status: EmployeeStatus
}

export interface EmployeeAssignmentOrganizationalUnitResponse {
  id: string
  code: string
  name: string
}

export interface EmployeeAssignmentPositionResponse {
  id: string
  code: string
  name: string
}

export interface EmployeeAssignmentResponse {
  id: string
  employeeId: string
  organizationalUnitId: string
  positionId: string
  organizationalUnit: EmployeeAssignmentOrganizationalUnitResponse
  position: EmployeeAssignmentPositionResponse
  appointmentType: AppointmentType
  schedule: string | null
  effectiveFrom: string
  effectiveTo: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type EmployeeAssignmentsResponse = EmployeeAssignmentResponse[]

export const VACATION_PERIODS = ['FIRST', 'SECOND'] as const
export type VacationPeriod = (typeof VACATION_PERIODS)[number]

export const VACATION_BALANCE_STATUSES = [
  'NOT_ELIGIBLE',
  'NOT_STARTED',
  'AVAILABLE',
  'EXPIRED',
] as const
export type VacationBalanceStatus = (typeof VACATION_BALANCE_STATUSES)[number]

export interface EmployeeVacationAdjustmentResponse {
  id: string
  year: number
  period: VacationPeriod
  daysDelta: number
  reason: string
  createdBy: {
    id: string
    fullName: string
  }
  createdAt: string
}

export interface CreateEmployeeVacationAdjustmentRequest {
  year: number
  period: VacationPeriod
  daysDelta: number
  reason: string
}

export interface EmployeeVacationPeriodBalanceResponse {
  period: VacationPeriod
  startDate: string
  endDate: string
  entitlementDays: number
  incidentDays: number
  adjustmentDays: number
  consumedDays: number
  remainingDays: number
  status: VacationBalanceStatus
  adjustments: EmployeeVacationAdjustmentResponse[]
}

export interface EmployeeVacationYearBalanceResponse {
  year: number
  periods: EmployeeVacationPeriodBalanceResponse[]
}

export interface EmployeeVacationControlResponse {
  eligibilityDate: string | null
  isEligible: boolean
  currentYear: number
  currentPeriod: VacationPeriod
  years: EmployeeVacationYearBalanceResponse[]
}

export interface EmployeeJustificationMonthResponse {
  month: string
  entryCount: number
  exitCount: number
  used: number
  remaining: number
}

export interface EmployeeJustificationControlResponse {
  currentMonth: string
  months: EmployeeJustificationMonthResponse[]
}

export interface CreateEmployeeAssignmentRequest {
  organizationalUnitId: string
  positionId: string
  appointmentType: AppointmentType
  schedule?: string | null
  effectiveFrom: string
  effectiveTo?: string | null
  notes?: string | null
}

export interface UpdateEmployeeAssignmentRequest {
  organizationalUnitId?: string
  positionId?: string
  appointmentType?: AppointmentType
  schedule?: string | null
  effectiveFrom?: string
  effectiveTo?: string | null
  notes?: string | null
}

export interface EmployeeDetailsResponse extends EmployeeResponse {
  assignments: EmployeeAssignmentsResponse
  vacationControl: EmployeeVacationControlResponse
  justificationControl: EmployeeJustificationControlResponse
}
