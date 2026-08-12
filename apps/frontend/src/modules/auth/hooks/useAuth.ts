import { useQuery } from '@tanstack/react-query'
import type { AuthMeResponse } from '@sigip/shared'

import { ApiError } from '@/lib/api/api-error'
import { getCurrentUser } from '../api/auth.api'

export const authQueryKey = ['auth', 'me'] as const

export function useAuth() {
  return useQuery<AuthMeResponse | null>({
    queryKey: authQueryKey,
    queryFn: async ({ signal }) => {
      try {
        return await getCurrentUser(signal)
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 401) && failureCount < 1,
    staleTime: 60_000,
  })
}

export function hasPermission(
  permissions: readonly string[] | undefined,
  permission: string,
): boolean {
  return permissions?.includes(permission) ?? false
}
