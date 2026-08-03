import { formatDate } from '@/lib/formatters'

import PageHeader from '@/components/page-header'
import { Errorstate } from '@/components/table/error-state'
import { EmptyState } from '@/components/table/empty-state'
import { TableSkeleton } from '@/components/skeletons/table-skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PermissionCreate from '../components/PermissionCreate'
import PermissionActions from '../components/PermissionActions'
import { usePermissions } from '../hooks/usePermissions'

export function PermissionsPage() {
  const permissionsQuery = usePermissions()
  const permissions = permissionsQuery.data ?? []

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Permisos"
          description="Gestiona los permisos de los usuarios en la aplicación y asigna roles específicos según sus responsabilidades."
        />

        <PermissionCreate />
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table aria-busy={permissionsQuery.isPending}>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Creado en</TableHead>
              <TableHead className="w-16">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {permissionsQuery.isPending ? (
              <TableSkeleton
                rows={9}
                columns={[
                  { className: 'w-36' },
                  { className: 'w-full max-w-80' },
                  { className: 'w-28' },
                ]}
                actions
              />
            ) : null}

            {permissionsQuery.isError ? (
              <Errorstate
                colSpan={4}
                message="No fue posible cargar los permisos."
                onRetry={() => permissionsQuery.refetch()}
              />
            ) : null}

            {permissionsQuery.isSuccess && permissions.length === 0 ? (
              <EmptyState colSpan={4} message="No hay permisos registrados." />
            ) : null}

            {permissionsQuery.isSuccess
              ? permissions.map((permission) => (
                  <TableRow key={permission.id}>
                    <TableCell className="font-medium">
                      {permission.code}
                    </TableCell>
                    <TableCell className="max-w-md whitespace-normal">
                      {permission.description || 'Sin descripción'}
                    </TableCell>
                    <TableCell>{formatDate(permission.createdAt)}</TableCell>
                    <TableCell>
                      <PermissionActions permission={permission} />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
