import { useState } from 'react'
import {
  CircleAlertIcon,
  ClockIcon,
  LaptopIcon,
  LogOutIcon,
  MapPinIcon,
} from 'lucide-react'
import type { User, UserSession } from '../types/user.types'
import { formatDate } from '@/lib/formatters'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { StatusBadge } from '@/components/status-badge'
import { UserSessionsSkeleton } from './skeletons/UserSessionsSkeleton'
import UserSessionRevokeAlert from './UserSessionRevokeAlert'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useUserSessions } from '../hooks/useUserSessions'
import { hasPermission, useAuth } from '@/modules/auth'

interface Props {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function UserSessions({ user, open, onOpenChange }: Props) {
  const authQuery = useAuth()
  const sessionsQuery = useUserSessions(user.id, open)
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(
    null,
  )
  const canRevoke = hasPermission(
    authQuery.data?.permissions,
    'sessions:revoke',
  )
  const activeCount =
    sessionsQuery.data?.filter((session) => isSessionActive(session)).length ??
    0

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setSelectedSession(null)
    onOpenChange(nextOpen)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent className="gap-0 sm:max-w-xl">
          <SheetHeader className="p-6 pr-14">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-base font-semibold leading-none">
                Sesiones de {user.fullName}
              </SheetTitle>
              {sessionsQuery.isSuccess ? (
                <Badge variant="secondary">
                  {activeCount} {activeCount === 1 ? 'activa' : 'activas'}
                </Badge>
              ) : null}
            </div>
            <SheetDescription>
              @{user.username} · Revise cada acceso antes de invalidarlo.
            </SheetDescription>
          </SheetHeader>

          <Separator />

          <ScrollArea className="min-h-0 flex-1">
            <div
              className="flex flex-col gap-3 p-4 sm:p-6"
              aria-busy={sessionsQuery.isPending}
              aria-label="Sesiones del usuario"
            >
              {sessionsQuery.isPending ? (
                <span className="sr-only" role="status">
                  Cargando sesiones...
                </span>
              ) : null}
              {sessionsQuery.isPending ? <UserSessionsSkeleton /> : null}

              {sessionsQuery.isError ? (
                <Alert variant="destructive">
                  <CircleAlertIcon aria-hidden="true" />
                  <AlertTitle>No se pudieron cargar las sesiones</AlertTitle>
                  <AlertDescription>
                    {sessionsQuery.error.message}
                  </AlertDescription>
                  <Button
                    className="mt-2 w-fit"
                    variant="outline"
                    size="sm"
                    onClick={() => void sessionsQuery.refetch()}
                  >
                    Reintentar
                  </Button>
                </Alert>
              ) : null}

              {sessionsQuery.isSuccess && sessionsQuery.data.length === 0 ? (
                <div className="rounded-md border border-dashed p-8 text-center">
                  <LaptopIcon
                    className="mx-auto size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="mt-3 font-medium">Sin sesiones registradas</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Esta cuenta todavía no ha iniciado sesión.
                  </p>
                </div>
              ) : null}

              {sessionsQuery.data?.map((session) => {
                const isActive = isSessionActive(session)

                return (
                  <article
                    key={session.id}
                    className="rounded-md border bg-background p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                          <LaptopIcon className="size-4" aria-hidden="true" />
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium">
                              {getDeviceLabel(session.userAgent)}
                            </h3>
                            <StatusBadge isActive={isActive} />
                            {session.isCurrent ? (
                              <Badge variant="outline">Sesión actual</Badge>
                            ) : null}
                          </div>
                          <p className="mt-1 wrap-break-words text-xs text-muted-foreground">
                            {session.userAgent ?? 'Navegador no identificado'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                      <SessionFact icon={ClockIcon} label="Última actividad">
                        {formatDate(session.lastActivityAt)}
                      </SessionFact>
                      <SessionFact icon={MapPinIcon} label="Dirección IP">
                        {session.ipAddress ?? 'No disponible'}
                      </SessionFact>
                      <SessionFact icon={ClockIcon} label="Inicio">
                        {formatDate(session.createdAt)}
                      </SessionFact>
                      <SessionFact icon={ClockIcon} label="Expiración máxima">
                        {formatDate(session.absoluteExpiresAt)}
                      </SessionFact>
                      <SessionFact
                        icon={ClockIcon}
                        label="Expiración por inactividad"
                      >
                        {formatDate(session.idleExpiresAt)}
                      </SessionFact>
                    </dl>

                    {session.revokedAt ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Revocada el {formatDate(session.revokedAt)}
                        {session.revokedReason
                          ? ` · Motivo: ${getRevocationLabel(session.revokedReason)}`
                          : ''}
                      </p>
                    ) : !isActive ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Esta sesión ya expiró y no permite acceso al sistema.
                      </p>
                    ) : session.isCurrent ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        No puedes cerrar tu sesión actual desde aquí.
                      </p>
                    ) : canRevoke ? (
                      <div className="mt-4 flex justify-end border-t pt-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedSession(session)}
                        >
                          <LogOutIcon aria-hidden="true" />
                          Revocar sesión
                        </Button>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <UserSessionRevokeAlert
        user={user}
        session={selectedSession}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) setSelectedSession(null)
        }}
      />
    </>
  )
}

function SessionFact({
  icon: Icon,
  label,
  children,
}: React.PropsWithChildren<{
  icon: typeof ClockIcon
  label: string
}>) {
  return (
    <div className="flex gap-2">
      <Icon
        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div>
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd>{children}</dd>
      </div>
    </div>
  )
}

function getDeviceLabel(userAgent: string | null): string {
  if (!userAgent) return 'Dispositivo no identificado'
  if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'Dispositivo móvil'
  if (/windows/i.test(userAgent)) return 'Equipo Windows'
  if (/macintosh|mac os/i.test(userAgent)) return 'Equipo macOS'
  if (/linux/i.test(userAgent)) return 'Equipo Linux'
  return 'Navegador web'
}

function getRevocationLabel(reason: string): string {
  const labels: Record<string, string> = {
    LOGOUT: 'Cierre de sesión',
    LOGOUT_ALL: 'Cierre de todas las sesiones',
    ADMIN_REVOKED: 'Revocación administrativa',
    USER_DEACTIVATED: 'Usuario desactivado',
    PASSWORD_RESET: 'Contraseña actualizada',
  }

  return labels[reason] ?? reason
}

function isSessionActive(session: UserSession): boolean {
  if (session.revokedAt) return false

  const now = Date.now()
  return (
    new Date(session.idleExpiresAt).getTime() > now &&
    new Date(session.absoluteExpiresAt).getTime() > now
  )
}
