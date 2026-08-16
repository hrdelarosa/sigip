import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs'
import { INCIDENT_STATUSES } from '@sigip/shared'

export const incidentSearchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  search: parseAsString.withDefault(''),
  status: parseAsStringLiteral(INCIDENT_STATUSES),
  employeeId: parseAsString,
  incidentTypeId: parseAsString,
  organizationalUnitId: parseAsString,
  from: parseAsString,
  to: parseAsString,
}
