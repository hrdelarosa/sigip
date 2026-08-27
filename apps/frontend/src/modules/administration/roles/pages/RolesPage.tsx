import type { Role } from '../types/roles.types'
import { formatDate } from '@/lib/formatters'

import { StatusBadge } from '@/components/status-badge'
import { DataTable, type DataTableColumn } from '@/components/data-table'
import PageHeader from '@/components/page-header'
import RoleCreate from '../components/RoleCreate'
import RoleActions from '../components/RoleActions'
import { useRoles } from '../hooks/useRoles'
import { hasPermission, useAuth } from '@/modules/auth'

const columns: DataTableColumn<Role>[] = [
  {
    key: 'code',
    header: 'Código',
    cellClassName: 'font-medium',
    skeletonClassName: 'w-32',
    render: (role) => role.code,
  },
  {
    key: 'name',
    header: 'Nombre',
    skeletonClassName: 'w-40',
    render: (role) => role.name,
  },
  {
    key: 'description',
    header: 'Descripción',
    cellClassName: 'max-w-md whitespace-normal',
    skeletonClassName: 'w-full max-w-72',
    render: (role) => role.description || 'Sin descripción',
  },
  {
    key: 'status',
    header: 'Estado',
    skeletonClassName: 'w-16',
    render: (role) => <StatusBadge isActive={role.isActive} />,
  },
  {
    key: 'updatedAt',
    header: 'Actualizado en',
    skeletonClassName: 'w-28',
    render: (role) => formatDate(role.updatedAt),
  },
]

export function RolesPage() {
  const auth = useAuth()
  const canManage = hasPermission(auth.data?.permissions, 'settings:update')
  const rolesQuery = useRoles()

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Roles"
          description="Define responsabilidades, controla su estado y administra los permisos disponibles para cada rol."
        />
        {canManage ? <RoleCreate /> : null}
      </div>

      <DataTable
        columns={columns}
        data={rolesQuery.data ?? []}
        isPending={rolesQuery.isPending}
        isError={rolesQuery.isError}
        isSuccess={rolesQuery.isSuccess}
        onRetry={() => rolesQuery.refetch()}
        getRowKey={(role) => role.id}
        emptyMessage="No hay roles registrados."
        errorMessage="No fue posible cargar los roles."
        skeletonRows={9}
        renderActions={(role) => <RoleActions role={role} />}
      />
    </>
  )
}
