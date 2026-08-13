import { queryOptions } from '@tanstack/react-query'

import { ApiError } from '@/lib/api/api-error'
import { getCurrentUser } from '../api/auth.api'
import type { AuthenticatedUser } from '../types/auth.types'
import { authQueryKeys } from './auth-query-keys'

export const authQueryOptions = () =>
  queryOptions<AuthenticatedUser | null>({
    queryKey: authQueryKeys.currentUser(),
    queryFn: async ({ signal }) => {
      try {
        return await getCurrentUser({ signal })
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) return null
        throw error
      }
    },
    retry: (failureCount, error) =>
      !(error instanceof ApiError && error.status === 401) && failureCount < 1,
    staleTime: 60_000,
  })
