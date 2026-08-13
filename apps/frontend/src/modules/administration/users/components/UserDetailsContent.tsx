import type { UserDetailsResponse, UserPermissionResponse } from '@sigip/shared'
import {
  CalendarPlusIcon,
  Clock3Icon,
  KeyRoundIcon,
  LogInIcon,
  MonitorSmartphoneIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  UserRoundCheckIcon,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { formatDate, formatRelative } from '@/lib/formatters'

const moduleLabels: Record<string, string> = {
  audit: 'Auditoría',
  catalogs: 'Catálogos',
  dashboard: 'Panel',
  documents: 'Documentos',
  employees: 'Empleados',
  incidents: 'Incidencias',
  permissions: 'Permisos',
  reports: 'Reportes',
  roles: 'Roles',
  sessions: 'Sesiones',
  settings: 'Configuración',
  users: 'Usuarios',
}

const actionLabels: Record<string, string> = {
  activate: 'Activar',
  cancel: 'Cancelar',
  create: 'Crear',
  deactivate: 'Desactivar',
  delete: 'Eliminar',
  export: 'Exportar',
  read: 'Consultar',
  'reset-password': 'Restablecer contraseña',
  revoke: 'Revocar',
  update: 'Editar',
}

export function UserDetailsContent({
  details,
}: {
  details: UserDetailsResponse
}) {
  const permissionLabel =
    details.permissions.length === 1
      ? '1 permiso efectivo'
      : `${details.permissions.length} permisos efectivos`

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="user-access-heading">
        <SectionTitle id="user-access-heading">Acceso asignado</SectionTitle>
        <Card className="relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
          <CardContent className="flex gap-4 pl-5">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheckIcon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-heading font-medium">
                  {details.role.name}
                </h3>
                <Badge variant="outline" className="font-mono">
                  {details.role.code}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {details.role.description || 'Rol sin descripción.'}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <KeyRoundIcon className="size-3.5" aria-hidden="true" />
                {permissionLabel}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <PermissionsSection permissions={details.permissions} />

      <section aria-labelledby="user-account-heading">
        <SectionTitle id="user-account-heading">Cuenta</SectionTitle>
        <dl className="divide-y rounded-lg border bg-card px-4">
          <AccountDatum
            icon={LogInIcon}
            label="Último acceso"
            value={
              details.lastLoginAt ? formatDate(details.lastLoginAt) : 'Nunca'
            }
            hint={formatRelative(details.lastLoginAt)}
          />
          <AccountDatum
            icon={CalendarPlusIcon}
            label="Creada"
            value={formatDate(details.createdAt)}
            hint={formatRelative(details.createdAt)}
          />
          <AccountDatum
            icon={RefreshCwIcon}
            label="Actualizada"
            value={formatDate(details.updatedAt)}
            hint={formatRelative(details.updatedAt)}
          />
          {details.createdBy ? (
            <AccountDatum
              icon={UserRoundCheckIcon}
              label="Registrada por"
              value={details.createdBy.fullName}
              hint={`@${details.createdBy.username}`}
            />
          ) : null}
          {details.sessionSummary ? (
            <AccountDatum
              icon={Clock3Icon}
              label="Expira la sesión actual"
              value={
                details.sessionSummary.currentSessionExpiresAt
                  ? formatDate(details.sessionSummary.currentSessionExpiresAt)
                  : 'No corresponde a este usuario'
              }
              hint={formatRelative(
                details.sessionSummary.currentSessionExpiresAt,
              )}
            />
          ) : null}
        </dl>
      </section>

      {details.sessionSummary ? (
        <section aria-labelledby="user-security-heading">
          <SectionTitle id="user-security-heading">Seguridad</SectionTitle>
          <div className="flex items-center gap-4 rounded-lg border bg-muted/30 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground ring-1 ring-foreground/10">
              <MonitorSmartphoneIcon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Sesiones del usuario</p>
              <p className="text-xs text-muted-foreground">
                {details.sessionSummary.activeCount === 1
                  ? '1 sesión activa'
                  : `${details.sessionSummary.activeCount} sesiones activas`}
              </p>
            </div>
            <Separator orientation="vertical" className="h-9" />
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold tabular-nums">
                {details.sessionSummary.recentCount}
              </p>
              <p className="text-xs text-muted-foreground">en 7 días</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}

function PermissionsSection({
  permissions,
}: {
  permissions: UserPermissionResponse[]
}) {
  const groups = groupPermissions(permissions)

  return (
    <section aria-labelledby="user-permissions-heading">
      <div className="mb-3 flex items-center justify-between gap-3">
        <SectionTitle id="user-permissions-heading" className="mb-0">
          Permisos
        </SectionTitle>
        <Badge variant="outline" className="tabular-nums">
          {permissions.length}
        </Badge>
      </div>

      {groups.length ? (
        <div className="space-y-4 border-b pb-5">
          {groups.map((group) => (
            <div key={group.module}>
              <h3 className="mb-1.5 text-sm font-semibold">
                {moduleLabels[group.module] ?? formatCodePart(group.module)}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {group.permissions.map((permission) => {
                  const action = permission.code.split(':').slice(1).join(':')

                  return (
                    <Tooltip key={permission.id}>
                      <TooltipTrigger
                        render={
                          <button
                            type="button"
                            className="inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          />
                        }
                      >
                        <KeyRoundIcon
                          className="size-3.5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {actionLabels[action] ?? formatCodePart(action)}
                      </TooltipTrigger>
                      <TooltipContent className="max-w-72 items-start">
                        <code className="shrink-0 font-mono">
                          {permission.code}
                        </code>
                        <span>
                          {permission.description || 'Sin descripción.'}
                        </span>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
          Este rol no concede permisos al usuario.
        </p>
      )}
    </section>
  )
}

function groupPermissions(permissions: UserPermissionResponse[]) {
  const groups = new Map<string, UserPermissionResponse[]>()

  for (const permission of permissions) {
    const module = permission.code.split(':')[0]
    const current = groups.get(module) ?? []
    current.push(permission)
    groups.set(module, current)
  }

  return Array.from(groups, ([module, groupedPermissions]) => ({
    module,
    permissions: groupedPermissions,
  }))
}

function formatCodePart(value: string) {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function AccountDatum({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ElementType
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-3 py-3">
      <Icon
        className="mt-0.5 size-4 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="flex min-w-0 items-start justify-between gap-3">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="min-w-0 text-right text-sm font-medium">
          <span className="block">{value}</span>
          {hint ? (
            <span className="block text-xs font-normal text-muted-foreground">
              {hint}
            </span>
          ) : null}
        </dd>
      </div>
    </div>
  )
}

function SectionTitle({
  className = 'mb-2',
  ...props
}: React.ComponentProps<'h2'>) {
  return (
    <h2
      className={`text-xs font-semibold uppercase tracking-wide text-muted-foreground ${className}`}
      {...props}
    />
  )
}
