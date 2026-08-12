import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { LaptopIcon, LogOutIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/formatters'
import { getSessions, revokeSession } from '../api/sessions.api'
import { useLogout } from '../hooks/useLogout'

const sessionsQueryKey = ['sessions', 'current-user'] as const

export function SessionsPage() {
  const queryClient = useQueryClient()
  const logout = useLogout()
  const sessions = useQuery({
    queryKey: sessionsQueryKey,
    queryFn: getSessions,
  })
  const revoke = useMutation({
    mutationFn: revokeSession,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: sessionsQueryKey }),
  })

  return (
    <section aria-labelledby="sessions-title">
      <div className="mb-6">
        <h1 id="sessions-title" className="text-2xl font-semibold">
          Sesiones
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulte los accesos de su cuenta y revoque los que no reconozca.
        </p>
      </div>

      {sessions.isPending ? (
        <p className="text-sm text-muted-foreground" aria-busy="true">
          Cargando sesiones...
        </p>
      ) : sessions.isError ? (
        <div role="alert">
          <p className="text-sm text-destructive">{sessions.error.message}</p>
          <Button
            className="mt-3"
            variant="outline"
            onClick={() => void sessions.refetch()}
          >
            Reintentar
          </Button>
        </div>
      ) : (
        <ul className="divide-y rounded-lg border bg-background">
          {sessions.data.map((session) => (
            <li
              key={session.id}
              className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 gap-3">
                <LaptopIcon
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="font-medium">
                    {session.isCurrent ? 'Sesión actual' : 'Sesión registrada'}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {session.userAgent ?? 'Dispositivo no identificado'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Última actividad: {formatDate(session.lastActivityAt)}
                    {session.ipAddress ? ` · IP ${session.ipAddress}` : ''}
                  </p>
                  {session.revokedAt ? (
                    <p className="mt-1 text-xs text-destructive">
                      Revocada el {formatDate(session.revokedAt)}
                    </p>
                  ) : null}
                </div>
              </div>

              {!session.revokedAt ? (
                <Button
                  variant="outline"
                  disabled={revoke.isPending || logout.isPending}
                  onClick={() =>
                    session.isCurrent
                      ? logout.mutate()
                      : revoke.mutate(session.id)
                  }
                >
                  <LogOutIcon aria-hidden="true" />
                  Revocar
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
