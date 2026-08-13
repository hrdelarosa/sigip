import { useQuery } from '@tanstack/react-query'

import { authQueryOptions } from '../queries/auth-query-options'

export function useAuth() {
  return useQuery(authQueryOptions())
}

export function hasPermission(
  permissions: readonly string[] | undefined,
  permission: string,
): boolean {
  return permissions?.includes(permission) ?? false
}
