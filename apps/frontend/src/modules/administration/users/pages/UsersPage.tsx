import type { UserResponse } from '@sigip/shared'
import { CircleAlert } from 'lucide-react'
import { DataTable, type DataTableColumn } from '@/components/data-table'
import PageHeader from '@/components/page-header'
import { StatusBadge } from '@/components/status-badge'
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/formatters'
import { useRoles } from '../../roles/hooks/useRoles'
import UserActions from '../components/UserActions'
import UserCreate from '../components/UserCreate'
import { useUsers } from '../hooks/useUsers'

export function UsersPage() {
  const usersQuery = useUsers()
  const rolesQuery = useRoles()
  const roles = rolesQuery.data ?? []
  const columns: DataTableColumn<UserResponse>[] = [
    {
      key: 'fullName',
      header: 'Nombre',
      cellClassName: 'font-medium',
      skeletonClassName: 'w-40',
      render: (user) => user.fullName,
    },
    {
      key: 'username',
      header: 'Usuario',
      skeletonClassName: 'w-28',
      render: (user) => <span className="font-mono">{user.username}</span>,
    },
    {
      key: 'role',
      header: 'Rol',
      skeletonClassName: 'w-32',
      render: (user) =>
        rolesQuery.isPending
          ? 'Cargando rol...'
          : (roles.find((role) => role.id === user.roleId)?.name ??
            'Rol no disponible'),
    },
    {
      key: 'status',
      header: 'Estado',
      skeletonClassName: 'w-16',
      render: (user) => <StatusBadge isActive={user.isActive} />,
    },
    {
      key: 'lastLoginAt',
      header: 'Último acceso',
      skeletonClassName: 'w-28',
      render: (user) =>
        user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca',
    },
  ]

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Usuarios"
          description="Administra las cuentas internas, sus roles, credenciales y disponibilidad de acceso."
        />
        <UserCreate />
      </div>

      {rolesQuery.isError ? (
        <Alert variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>No se pudieron cargar los roles</AlertTitle>
          <AlertDescription>
            Los usuarios están disponibles, pero no es posible mostrar ni
            asignar roles hasta recuperar esta información.
          </AlertDescription>
          <AlertAction>
            <Button
              variant="outline"
              size="xs"
              onClick={() => rolesQuery.refetch()}
            >
              Reintentar
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={usersQuery.data ?? []}
        isPending={usersQuery.isPending}
        isError={usersQuery.isError}
        isSuccess={usersQuery.isSuccess}
        onRetry={() => usersQuery.refetch()}
        getRowKey={(user) => user.id}
        emptyMessage="No hay usuarios registrados."
        errorMessage="No fue posible cargar los usuarios."
        skeletonRows={8}
        renderActions={(user) => <UserActions user={user} roles={roles} />}
      />
    </>
  )
}
