import { useQuery } from '@tanstack/react-query'
import { organizationalUnitDetailQueryOptions } from '../queries/organizational-unit-query-options'

export function useOrganizationalUnit(id: string | null) {
  return useQuery({
    ...organizationalUnitDetailQueryOptions(id ?? ''),
    enabled: Boolean(id),
  })
}
