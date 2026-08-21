import { FilePlus2Icon } from 'lucide-react'
import { useLocation } from 'wouter'

import { routes } from '@/app/router/routes'
import { DataTable } from '@/components/data-table'
import PageHeader from '@/components/page-header'
import { PaginationPage } from '@/components/pagination-page'
import { Button } from '@/components/ui/button'
import { hasPermission, useAuth } from '@/modules/auth'
import { IncidentActions } from '../components/IncidentActions'
import { IncidentFilters } from '../components/IncidentFilters'
import { incidentTableColumns } from '../components/IncidentTableColumns'
import { useIncidentsPage } from '../hooks/useIncidentsPage'

export function IncidentsPage() {
  const {
    incidentsQuery,
    meta,
    limit,
    pageSizes,
    hasFilters,
    setPageSize,
    goToNextPage,
    goToPreviousPage,
  } = useIncidentsPage()
  const auth = useAuth()
  const [, navigate] = useLocation()
  const canCreate = [
    'incidents:create',
    'incidents:read',
    'employees:read',
    'catalogs:read',
  ].every((permission) => hasPermission(auth.data?.permissions, permission))

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Incidencias"
          description="Consulta los formatos recibidos, sus fechas de aplicación y el expediente documental de cada empleado."
        />
        {canCreate ? (
          <Button onClick={() => navigate(routes.incidents.create)}>
            <FilePlus2Icon data-icon="inline-start" />
            Registrar incidencia
          </Button>
        ) : null}
      </div>

      <IncidentFilters />

      <DataTable
        columns={incidentTableColumns}
        data={incidentsQuery.data?.items}
        isPending={incidentsQuery.isPending}
        isError={incidentsQuery.isError}
        isSuccess={incidentsQuery.isSuccess}
        onRetry={() => incidentsQuery.refetch()}
        getRowKey={(incident) => incident.id}
        emptyMessage={
          hasFilters
            ? 'No hay incidencias que coincidan con los filtros.'
            : 'No hay incidencias registradas.'
        }
        errorMessage="No fue posible cargar las incidencias."
        skeletonRows={Math.min(limit, 10)}
        renderActions={(incident) => <IncidentActions incident={incident} />}
      />

      <PaginationPage
        text="incidencias"
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
