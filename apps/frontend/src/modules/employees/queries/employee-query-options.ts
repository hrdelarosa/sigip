import { queryOptions } from '@tanstack/react-query'

import {
  getEmployeeAssignmentById,
  getEmployeeAssignments,
  getEmployeeById,
  getEmployees,
} from '../api/employees.api'
import { employeeQueryKeys } from './employee-query-keys'
import type { EmployeeListParams } from '../types/employee.types'

const staleTime = 5 * 60 * 1000

export const employeeQueryOptions = (params: EmployeeListParams = {}) =>
  queryOptions({
    queryKey: employeeQueryKeys.list(params),
    queryFn: () => getEmployees(params),
    staleTime,
  })

export const employeeDetailQueryOptions = (employeeId: string) =>
  queryOptions({
    queryKey: employeeQueryKeys.detail(employeeId),
    queryFn: () => getEmployeeById({ id: employeeId }),
    staleTime,
  })

export const employeeAssignmentsQueryOptions = (employeeId: string) =>
  queryOptions({
    queryKey: employeeQueryKeys.assignments(employeeId),
    queryFn: () => getEmployeeAssignments({ employeeId }),
    staleTime,
  })

export const employeeAssignmentQueryOptions = (
  employeeId: string,
  assignmentId: string,
) =>
  queryOptions({
    queryKey: employeeQueryKeys.assignment(employeeId, assignmentId),
    queryFn: () => getEmployeeAssignmentById({ employeeId, assignmentId }),
    staleTime,
  })
