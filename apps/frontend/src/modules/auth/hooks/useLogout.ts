import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLocation } from 'wouter'

import { routes } from '@/app/router/routes'
import { advanceSessionGeneration } from '@/lib/api/auth-session-events'
import { ApiError } from '@/lib/api/api-error'
import { logout } from '../api/auth.api'
import { authQueryKey } from './useAuth'

export function useLogout() {
  const queryClient = useQueryClient()
  const [, navigate] = useLocation()

  async function clearLocalSession() {
    await queryClient.cancelQueries()
    advanceSessionGeneration()
    queryClient.setQueryData(authQueryKey, null)
    queryClient.removeQueries({
      predicate: (query) => query.queryKey[0] !== 'auth',
    })
    navigate(routes.auth.login, { replace: true })
  }

  return useMutation({
    mutationFn: logout,
    onSuccess: clearLocalSession,
    onError: async (error) => {
      if (error instanceof ApiError && error.status === 401) {
        await clearLocalSession()
        return
      }

      toast.error('No se pudo cerrar la sesión', {
        description:
          'La sesión continúa activa. Revise su conexión e intente nuevamente.',
      })
    },
  })
}
