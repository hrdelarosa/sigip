import { useQuery } from '@tanstack/react-query'
import { roleDetailQueryOptions } from '../queries/role-query-options'

export function useRole(id: string | null) {
  return useQuery({
    ...roleDetailQueryOptions(id ?? ''),
    enabled: Boolean(id),
  })
}
