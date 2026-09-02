import type { UserResponse } from '@sigip/shared'
import { CircleAlert } from 'lucide-react'

import { DataTable, type DataTableColumn } from '@/components/data-table'
import PageHeader from '@/components/page-header'
import { Spinner } from '@/components/ui/spinner'
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
import { useOffices } from '../../offices/hooks/useOffices'
import UserActions from '../components/UserActions'
import UserCreate from '../components/UserCreate'
import { hasPermission, useAuth } from '@/modules/auth'
import { PaginationPage } from '@/components/pagination-page'
import { useUsersPage } from '../hooks/useUsersPage'

export function UsersPage() {
  const auth = useAuth()
  const canCreate = hasPermission(auth.data?.permissions, 'users:create')
  const {
    usersQuery,
    meta,
    limit,
    pageSizes,
    setPageSize,
    goToPreviousPage,
    goToNextPage,
  } = useUsersPage()
  const rolesQuery = useRoles()
  const roles = rolesQuery.data ?? []
  const officesQuery = useOffices()
  const offices = officesQuery.data ?? []
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
      key: 'office',
      header: 'Oficina',
      skeletonClassName: 'w-46',
      render: (user) =>
        officesQuery.isPending
          ? 'Cargando oficina...'
          : (offices.find((office) => office.id === user.officeId)?.name ??
            'Oficina no disponible'),
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
        {canCreate ? <UserCreate /> : null}
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
              {rolesQuery.isPending ? <Spinner /> : 'Reintentar'}
              Reintentar
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <DataTable
        columns={columns}
        data={usersQuery.data?.items}
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
      <PaginationPage
        text="usuarios"
        meta={meta}
        limit={limit}
        pageSizes={pageSizes}
        onValueChange={setPageSize}
        onPreviousClick={goToPreviousPage}
        onNextClick={goToNextPage}
      />
    </>
  )
}
