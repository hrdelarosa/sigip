import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '../api/auth.api'
import { advanceSessionGeneration } from '@/lib/api/auth-session-events'
import { authQueryKeys } from '../queries/auth-query-keys'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onMutate: () =>
      queryClient.cancelQueries({ queryKey: authQueryKeys.currentUser() }),
    onSuccess: (user) => {
      advanceSessionGeneration()
      queryClient.setQueryData(authQueryKeys.currentUser(), user)
    },
  })
}
