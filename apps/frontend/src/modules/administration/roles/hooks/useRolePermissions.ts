import { useQuery } from '@tanstack/react-query'
import { rolePermissionsQueryOptions } from '../queries/role-query-options'

export function useRolePermissions(id: string | null) {
  return useQuery({
    ...rolePermissionsQueryOptions(id ?? ''),
    enabled: Boolean(id),
  })
}
