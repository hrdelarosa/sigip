import type { Position } from '../types/positions.types'
import { formatDate } from '@/lib/formatters'

import { StatusBadge } from '@/components/status-badge'
import { DataTable, type DataTableColumn } from '@/components/data-table'
import PageHeader from '@/components/page-header'
import PositionCreate from '../components/PositionCreate'
import PositionActions from '../components/PositionActions'
import { usePositions } from '../hooks/usePositions'
import { parseAsString, useQueryState } from 'nuqs'
import PositionDetails from '../components/PositionDetails'

const columns: DataTableColumn<Position>[] = [
  {
    key: 'code',
    header: 'Código',
    cellClassName: 'font-medium',
    skeletonClassName: 'w-32',
    render: (position) => position.code,
  },
  {
    key: 'name',
    header: 'Nombre',
    skeletonClassName: 'w-40',
    render: (position) => position.name,
  },
  {
    key: 'description',
    header: 'Descripción',
    cellClassName: 'max-w-md whitespace-normal',
    skeletonClassName: 'w-full max-w-72',
    render: (position) => position.description || 'Sin descripción',
  },
  {
    key: 'status',
    header: 'Estado',
    skeletonClassName: 'w-16',
    render: (position) => <StatusBadge isActive={position.isActive} />,
  },
  {
    key: 'updatedAt',
    header: 'Actualizado en',
    skeletonClassName: 'w-28',
    render: (position) => formatDate(position.updatedAt),
  },
]

export function PositionsPage() {
  const positionsQuery = usePositions()
  const [detailsId, setDetailsId] = useQueryState('details', parseAsString)

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Puestos"
          description="Define los puestos disponibles, controla su estado y administra los permisos disponibles para cada puesto."
        />

        <PositionCreate />
      </div>

      <DataTable
        columns={columns}
        data={positionsQuery.data ?? []}
        isPending={positionsQuery.isPending}
        isError={positionsQuery.isError}
        isSuccess={positionsQuery.isSuccess}
        onRetry={() => positionsQuery.refetch()}
        getRowKey={(position) => position.id}
        emptyMessage="No hay puestos resgistrados."
        errorMessage="No fue posible cargar los puestos."
        skeletonRows={9}
        renderActions={(position) => <PositionActions position={position} />}
      />

      {detailsId ? (
        <PositionDetails
          positionId={detailsId}
          open
          onOpenChange={(open) => {
            if (!open) void setDetailsId(null, { history: 'replace' })
          }}
        />
      ) : null}
    </>
  )
}
