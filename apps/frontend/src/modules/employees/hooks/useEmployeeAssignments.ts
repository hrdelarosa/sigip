import { useQuery } from '@tanstack/react-query'
import {
  employeeAssignmentQueryOptions,
  employeeAssignmentsQueryOptions,
} from '../queries/employee-query-options'

export function useEmployeeAssignments(employeeId: string | null) {
  return useQuery({
    ...employeeAssignmentsQueryOptions(employeeId ?? ''),
    enabled: Boolean(employeeId),
  })
}

export function useEmployeeAssignment(
  employeeId: string | null,
  assignmentId: string | null,
) {
  return useQuery({
    ...employeeAssignmentQueryOptions(employeeId ?? '', assignmentId ?? ''),
    enabled: Boolean(employeeId && assignmentId),
  })
}
