import type { PropsWithChildren } from 'react'
import { Link, Redirect } from 'wouter'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { hasPermission, useAuth } from '@/modules/auth'
import { routes } from './routes'

interface ProtectedRouteProps extends PropsWithChildren {
  permission?: string
  permissions?: readonly string[]
}

export function ProtectedRoute({
  children,
  permission,
  permissions = [],
}: ProtectedRouteProps) {
  const auth = useAuth()

  if (auth.isPending) {
    return (
      <div className="grid min-h-screen place-items-center" aria-busy="true">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner aria-hidden="true" /> Restaurando sesión...
        </div>
      </div>
    )
  }

  if (auth.isError) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-semibold">
            No se pudo validar la sesión
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Revise su conexión e intente nuevamente.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button onClick={() => void auth.refetch()}>Reintentar</Button>
            <Button
              variant="outline"
              render={<Link href={routes.auth.login} />}
            >
              Ir al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!auth.data) {
    const returnTo = `${window.location.pathname}${window.location.search}`

    return (
      <Redirect
        to={`${routes.auth.login}?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    )
  }

  const requiredPermissions = permission
    ? [permission, ...permissions]
    : permissions
  const grantedPermissions = auth.data.permissions

  if (
    requiredPermissions.some(
      (requiredPermission) =>
        !hasPermission(grantedPermissions, requiredPermission),
    )
  ) {
    return (
      <div className="grid min-h-screen place-items-center p-6">
        <div className="max-w-md text-center">
          <p className="text-sm font-medium text-destructive">
            Acceso denegado
          </p>
          <h1 className="mt-1 text-2xl font-semibold">
            Permisos insuficientes
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Su cuenta no tiene autorización para consultar esta sección.
          </p>
        </div>
      </div>
    )
  }

  return children
}
