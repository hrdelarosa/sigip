import { useQuery } from '@tanstack/react-query'

import { userSessionsQueryOptions } from '../queries/user-query-options'

export function useUserSessions(userId: string | null, enabled: boolean) {
  return useQuery({
    ...userSessionsQueryOptions(userId ?? ''),
    enabled: Boolean(userId) && enabled,
  })
}
