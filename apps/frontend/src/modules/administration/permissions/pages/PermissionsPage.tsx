import type { Permission } from '../types/permission.types'
import { formatDate } from '@/lib/formatters'

import { DataTable, type DataTableColumn } from '@/components/data-table'
import PageHeader from '@/components/page-header'
// import PermissionCreate from '../components/PermissionCreate'
import PermissionActions from '../components/PermissionActions'
import { usePermissions } from '../hooks/usePermissions'
// import { hasPermission, useAuth } from '@/modules/auth'

const columns: DataTableColumn<Permission>[] = [
  {
    key: 'code',
    header: 'Código',
    cellClassName: 'font-medium',
    skeletonClassName: 'w-36',
    render: (permission) => permission.code,
  },
  {
    key: 'description',
    header: 'Descripción',
    cellClassName: 'max-w-md whitespace-normal',
    skeletonClassName: 'w-full max-w-80',
    render: (permission) => permission.description || 'Sin descripción',
  },
  {
    key: 'createdAt',
    header: 'Creado en',
    skeletonClassName: 'w-28',
    render: (permission) => formatDate(permission.createdAt),
  },
]

export function PermissionsPage() {
  // const auth = useAuth()
  // const canManage = hasPermission(auth.data?.permissions, 'settings:update')
  const permissionsQuery = usePermissions()
  const permissions = permissionsQuery.data ?? []

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Permisos"
          description="Gestiona los permisos de los usuarios en la aplicación y asigna roles específicos según sus responsabilidades."
        />

        {/* {canManage ? <PermissionCreate /> : null} */}
      </div>

      <DataTable
        columns={columns}
        data={permissions}
        isPending={permissionsQuery.isPending}
        isError={permissionsQuery.isError}
        isSuccess={permissionsQuery.isSuccess}
        onRetry={() => permissionsQuery.refetch()}
        getRowKey={(permission) => permission.id}
        emptyMessage="No hay permisos registrados."
        errorMessage="No fue posible cargar los permisos."
        skeletonRows={9}
        renderActions={(permission) => (
          <PermissionActions permission={permission} />
        )}
      />
    </>
  )
}
