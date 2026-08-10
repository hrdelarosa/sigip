import { EMPLOYEE_STATUSES } from '@sigip/shared'
import { parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs'
import { employeeSortOptions } from '../types/employee.types'

export const employeeSearchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  search: parseAsString.withDefault(''),
  sort: parseAsStringLiteral(employeeSortOptions),
  status: parseAsStringLiteral(EMPLOYEE_STATUSES),
  organizationalUnitId: parseAsString,
  positionId: parseAsString,
}
