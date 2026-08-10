import { useQuery } from '@tanstack/react-query'
import { employeeDetailQueryOptions } from '../queries/employee-query-options'

export function useEmployee(employeeId: string | null) {
  return useQuery({
    ...employeeDetailQueryOptions(employeeId ?? ''),
    enabled: Boolean(employeeId),
  })
}
