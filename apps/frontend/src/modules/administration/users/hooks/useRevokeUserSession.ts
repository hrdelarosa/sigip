import { useMutation, useQueryClient } from '@tanstack/react-query'

import { revokeUserSession } from '../api/user-sessions.api'
import { userQueryKeys } from '../queries/user-query-keys'

export function useRevokeUserSession(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: revokeUserSession,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: userQueryKeys.sessions(userId),
      })
    },
  })
}
