import { useQuery } from '@tanstack/react-query'
import { employeeQueryOptions } from '../queries/employee-query-options'
import type { EmployeeListParams } from '../types/employee.types'

export function useEmployees(params: EmployeeListParams = {}) {
  return useQuery(employeeQueryOptions(params))
}
