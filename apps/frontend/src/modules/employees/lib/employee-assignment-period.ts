import type { EmployeeAssignment } from '../types/employee.types'
import { format } from 'date-fns'

export type EmployeeAssignmentPeriod = 'current' | 'future' | 'historical'

export function getEmployeeAssignmentPeriod(
  assignment: EmployeeAssignment,
  today = format(new Date(), 'yyyy-MM-dd'),
): EmployeeAssignmentPeriod {
  if (assignment.effectiveFrom > today) return 'future'
  if (!assignment.effectiveTo || assignment.effectiveTo >= today) return 'current'
  return 'historical'
}
