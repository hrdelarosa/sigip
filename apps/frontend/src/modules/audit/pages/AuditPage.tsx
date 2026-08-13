import { EyeIcon } from 'lucide-react'

import { DataTable, type DataTableColumn } from '@/components/data-table'
import PageHeader from '@/components/page-header'
import { PaginationPage } from '@/components/pagination-page'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/formatters'
import { AuditDetails } from '../components/AuditDetails'
import { AuditFilters } from '../components/AuditFilters'
import {
  auditActionLabels,
  auditEntityLabels,
} from '../constants/audit.constants'
import { useAuditPage } from '../hooks/useAuditPage'
import type { AuditLog } from '../types/audit.types'

const columns: DataTableColumn<AuditLog>[] = [
  {
    key: 'createdAt',
    header: 'Fecha',
    skeletonClassName: 'w-32',
    render: (item) => formatDate(item.createdAt),
  },
  {
    key: 'action',
    header: 'Acción',
    skeletonClassName: 'w-40',
    render: (item) => auditActionLabels[item.action] ?? item.action,
  },
  {
    key: 'entityType',
    header: 'Entidad',
    skeletonClassName: 'w-28',
    render: (item) => auditEntityLabels[item.entityType] ?? item.entityType,
  },
  {
    key: 'actor',
    header: 'Actor',
    skeletonClassName: 'w-40',
    render: (item) => item.actor?.fullName ?? 'Sistema / anónimo',
  },
]

export function AuditPage() {
  const {
    auditQuery,
    detailsId,
    hasFilters,
    limit,
    meta,
    pageSizes,
    setPageSize,
    goToPreviousPage,
    goToNextPage,
    openDetails,
    closeDetails,
  } = useAuditPage()

  return (
    <>
      <PageHeader
        title="Auditoría"
        description="Consulta la trazabilidad de accesos y cambios sensibles del sistema."
      />

      <AuditFilters />

      <DataTable
        columns={columns}
        data={auditQuery.data?.items}
        isPending={auditQuery.isPending}
        isError={auditQuery.isError}
        isSuccess={auditQuery.isSuccess}
        onRetry={() => auditQuery.refetch()}
        getRowKey={(item) => item.id}
        emptyMessage={
          hasFilters
            ? 'No hay eventos que coincidan con los filtros.'
            : 'No hay eventos de auditoría.'
        }
        errorMessage="No fue posible cargar la auditoría."
        skeletonRows={Math.min(limit, 10)}
        renderActions={(item) => (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Ver detalle de ${auditActionLabels[item.action] ?? item.action}`}
            onClick={() => openDetails(item.id)}
          >
            <EyeIcon aria-hidden="true" />
          </Button>
        )}
      />

      <PaginationPage
        text="eventos"
        meta={meta}
        limit={limit}
        pageSizes={pageSizes}
        onValueChange={setPageSize}
        onPreviousClick={goToPreviousPage}
        onNextClick={goToNextPage}
      />

      {detailsId ? (
        <AuditDetails
          auditId={detailsId}
          open
          onOpenChange={(open) => {
            if (!open) closeDetails()
          }}
        />
      ) : null}
    </>
  )
}
