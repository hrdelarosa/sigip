import { AUDIT_ACTIONS, AUDIT_ENTITY_TYPES } from '@sigip/shared'
import { parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs'

export const auditSearchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(20),
  action: parseAsStringLiteral(AUDIT_ACTIONS),
  entityType: parseAsStringLiteral(AUDIT_ENTITY_TYPES),
  entityId: parseAsString,
  createdFrom: parseAsString,
  createdTo: parseAsString,
  details: parseAsString,
}
