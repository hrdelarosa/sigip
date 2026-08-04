import { useQuery } from '@tanstack/react-query'
import { roleQueryOptions } from '../queries/role-query-options'

export function useRoles() {
  return useQuery(roleQueryOptions())
}
