export type {
  CreateEmployeeRequest as CreateEmployeeInput,
  EmployeeResponse as Employee,
  EmployeesResponse as Employees,
  EmployeeDetailsResponse as EmployeeDetails,
  UpdateEmployeeRequest as UpdateEmployeeInput,
  UpdateEmployeeStatusRequest as UpdateEmployeeStatusInput,
  EmployeeAssignmentResponse as EmployeeAssignment,
  EmployeeAssignmentsResponse as EmployeeAssignments,
  CreateEmployeeAssignmentRequest as CreateEmployeeAssignmentInput,
  UpdateEmployeeAssignmentRequest as UpdateEmployeeAssignmentInput,
  CreateEmployeeVacationAdjustmentRequest as CreateEmployeeVacationAdjustmentInput,
  EmployeeVacationAdjustmentResponse as EmployeeVacationAdjustment,
} from '@sigip/shared'
import type { EMPLOYEE_STATUSES, EmployeeStatus } from '@sigip/shared'

export const employeeSortOptions = [
  'employeeNumber',
  '-employeeNumber',
  'fullName',
  '-fullName',
  'hireDate',
  '-hireDate',
  'createdAt',
  '-createdAt',
] as const

export type EmployeeSort = (typeof employeeSortOptions)[number]

export interface EmployeeListParams {
  page?: number
  limit?: number
  search?: string
  sort?: EmployeeSort
  status?: EmployeeStatus
  organizationalUnitId?: string
  positionId?: string
}

export type EmployeeSearchParamsState = {
  page: number
  limit: number
  search: string
  sort: EmployeeSort | null
  status: (typeof EMPLOYEE_STATUSES)[number] | null
  organizationalUnitId: string | null
  positionId: string | null
}
