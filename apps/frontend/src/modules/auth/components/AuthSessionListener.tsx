import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { authQueryKey } from '../hooks/useAuth'
import {
  getSessionGeneration,
  UNAUTHORIZED_EVENT,
} from '@/lib/api/auth-session-events'

export function AuthSessionListener() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const handleUnauthorized = (event: Event) => {
      const generation = (event as CustomEvent<number>).detail
      if (generation !== getSessionGeneration()) return

      queryClient.setQueryData(authQueryKey, null)
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      })
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () =>
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [queryClient])

  return null
}
