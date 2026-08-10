import { useQuery } from '@tanstack/react-query'
import { organizationalUnitQueryOptions } from '../queries/organizational-unit-query-options'

export function useOrganizationalUnits() {
  return useQuery(organizationalUnitQueryOptions())
}
