import type { OrganizationalUnit } from '../types/organizational-units.types'
import { formatDate } from '@/lib/formatters'

import { StatusBadge } from '@/components/status-badge'
import { DataTable, type DataTableColumn } from '@/components/data-table'
import PageHeader from '@/components/page-header'
import OrganizationalUnitActions from '../components/OrganizationalUnitActions'
import { useOrganizationalUnits } from '../hooks/useOrganizationalUnits'
import OrganizationalUnitCreate from '../components/OrganizationalUnitCreate'
import { parseAsString, useQueryState } from 'nuqs'
import OrganizationalUnitDetails from '../components/OrganizationalUnitDetails'
import { hasPermission, useAuth } from '@/modules/auth'

const columns: DataTableColumn<OrganizationalUnit>[] = [
  {
    key: 'code',
    header: 'Código',
    cellClassName: 'font-medium',
    skeletonClassName: 'w-32',
    render: (organizationalUnit) => organizationalUnit.code,
  },
  {
    key: 'name',
    header: 'Nombre',
    skeletonClassName: 'w-40',
    render: (organizationalUnit) => organizationalUnit.name,
  },
  {
    key: 'description',
    header: 'Descripción',
    cellClassName: 'max-w-md whitespace-normal',
    skeletonClassName: 'w-full max-w-72',
    render: (organizationalUnit) =>
      organizationalUnit.description || 'Sin descripción',
  },
  {
    key: 'status',
    header: 'Estado',
    skeletonClassName: 'w-16',
    render: (organizationalUnit) => (
      <StatusBadge isActive={organizationalUnit.isActive} />
    ),
  },
  {
    key: 'updatedAt',
    header: 'Actualizado en',
    skeletonClassName: 'w-28',
    render: (organizationalUnit) => formatDate(organizationalUnit.updatedAt),
  },
]

export function OrganizationalUnitsPage() {
  const organizationalUnitsQuery = useOrganizationalUnits()
  const [detailsId, setDetailsId] = useQueryState('details', parseAsString)
  const auth = useAuth()
  const canCreate = hasPermission(auth.data?.permissions, 'catalogs:update')

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Unidades organizacionales"
          description="Administra las unidades organizacionales de la empresa, su estructura jerárquica y los empleados asignados a cada unidad."
        />

        {canCreate ? <OrganizationalUnitCreate /> : null}
      </div>

      <DataTable
        columns={columns}
        data={organizationalUnitsQuery.data ?? []}
        isPending={organizationalUnitsQuery.isPending}
        isError={organizationalUnitsQuery.isError}
        isSuccess={organizationalUnitsQuery.isSuccess}
        onRetry={() => organizationalUnitsQuery.refetch()}
        getRowKey={(organizationalUnit) => organizationalUnit.id}
        emptyMessage="No hay unidades organizacionales registradas."
        errorMessage="No fue posible cargar las unidades organizacionales."
        skeletonRows={9}
        renderActions={(organizationalUnit) => (
          <OrganizationalUnitActions
            organizationalUnit={organizationalUnit}
            onDetails={(id) => void setDetailsId(id)}
          />
        )}
      />

      {detailsId ? (
        <OrganizationalUnitDetails
          organizationalUnitId={detailsId}
          open
          onOpenChange={(open) => {
            if (!open) void setDetailsId(null, { history: 'replace' })
          }}
        />
      ) : null}
    </>
  )
}
