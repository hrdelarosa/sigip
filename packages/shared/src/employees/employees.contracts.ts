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
}
