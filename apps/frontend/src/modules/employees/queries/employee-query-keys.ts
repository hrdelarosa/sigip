import type { EmployeeListParams } from '../types/employee.types'

export const employeeQueryKeys = {
  all: ['employees'] as const,
  lists: () => [...employeeQueryKeys.all, 'list'] as const,
  list: (params: EmployeeListParams = {}) =>
    [...employeeQueryKeys.lists(), params] as const,
  details: () => [...employeeQueryKeys.all, 'detail'] as const,
  detail: (employeeId: string) =>
    [...employeeQueryKeys.details(), employeeId] as const,
  assignments: (employeeId: string) =>
    [...employeeQueryKeys.detail(employeeId), 'assignments'] as const,
  assignment: (employeeId: string, assignmentId: string) =>
    [...employeeQueryKeys.assignments(employeeId), assignmentId] as const,
}
