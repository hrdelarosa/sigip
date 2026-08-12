import { useMutation, useQueryClient } from '@tanstack/react-query'

import { login } from '../api/auth.api'
import { authQueryKey } from './useAuth'
import { advanceSessionGeneration } from '@/lib/api/auth-session-events'

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: login,
    onMutate: () => queryClient.cancelQueries({ queryKey: authQueryKey }),
    onSuccess: (user) => {
      advanceSessionGeneration()
      queryClient.setQueryData(authQueryKey, user)
    },
  })
}
