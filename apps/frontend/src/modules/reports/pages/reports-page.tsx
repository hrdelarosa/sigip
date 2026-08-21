import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useQueryStates } from 'nuqs'
import { RotateCcwIcon } from 'lucide-react'
import { toast } from 'sonner'

import PageHeader from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ApiError } from '@/lib/api/api-error'
import { useOrganizationalUnits } from '@/modules/administration/organizational-units/hooks/useOrganizationalUnits'
import { hasPermission, useAuth } from '@/modules/auth'
import { incidentTypesQueryOptions } from '@/modules/incidents/queries/incident-query-options'

import { downloadIncidentsReport } from '../api/reports.api'
import { ReportFilters } from '../components/report-filters'
import { ReportPreview } from '../components/report-preview'
import { useIncidentsReport } from '../hooks/use-incidents-report'
import {
  buildIncidentsReportFilters,
  isReportFilterValid,
  type ReportsFilterState,
} from '../lib/report-filters'
import { reportSearchParams } from '../queries/report-search-params'

export function ReportsPage() {
  const auth = useAuth()
  const [filters, setFilters] = useQueryStates(reportSearchParams)
  const state: ReportsFilterState = {
    period: filters.period,
    fortnight: filters.fortnight,
    month: filters.month,
    year: filters.year,
    startDate: filters.startDate ?? undefined,
    endDate: filters.endDate ?? undefined,
    incidentTypeId: filters.incidentTypeId ?? undefined,
    organizationalUnitId: filters.organizationalUnitId ?? undefined,
    includeCancelled: filters.includeCancelled,
  }
  const [previewEnabled, setPreviewEnabled] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const report = useIncidentsReport(state, previewEnabled)
  const canExport = hasPermission(auth.data?.permissions, 'reports:export')
  const isValid = isReportFilterValid(state)

  const typesQuery = useQuery(
    incidentTypesQueryOptions({ page: 1, limit: 100, isActive: true }),
  )
  const unitsQuery = useOrganizationalUnits()

  const typeItems = useMemo(
    () =>
      (typesQuery.data?.items ?? []).map((type) => ({
        value: type.id,
        label: type.name,
      })),
    [typesQuery.data],
  )

  const unitItems = useMemo(
    () =>
      (unitsQuery.data ?? []).map((unit) => ({
        value: unit.id,
        label: unit.name,
      })),
    [unitsQuery.data],
  )

  const catalogsLoading = typesQuery.isPending || unitsQuery.isPending
  const catalogsError = typesQuery.isError || unitsQuery.isError

  async function handleDownload() {
    setDownloading(true)

    try {
      await downloadIncidentsReport(buildIncidentsReportFilters(state))

      toast.success('Reporte PDF generado correctamente')
    } catch (error) {
      const message = getDownloadErrorMessage(error)

      toast.error(message)
    } finally {
      setDownloading(false)
    }
  }

  function handleChange(next: ReportsFilterState) {
    void setFilters(next)
    setPreviewEnabled(false)
  }

  return (
    <>
      <PageHeader
        title="Reportes"
        description="Genera reportes de incidencias de personal por quincena, mes, año o periodo personalizado."
      />

      <ReportFilters
        value={state}
        onChange={handleChange}
        onPreview={() => setPreviewEnabled(true)}
        onDownload={handleDownload}
        canExport={canExport}
        isValid={isValid}
        downloading={downloading}
        typeItems={typeItems}
        unitItems={unitItems}
        catalogsLoading={catalogsLoading}
        catalogsError={catalogsError}
        onRetryCatalogs={() => {
          void typesQuery.refetch()
          void unitsQuery.refetch()
        }}
      />

      {previewEnabled ? <ReportResult report={report} /> : null}
    </>
  )
}

function ReportResult({ report }: { report: ReturnType<typeof useIncidentsReport> }) {
  if (report.isPending) {
    return <ReportPreviewSkeleton />
  }

  if (report.isError) {
    return (
      <div className="flex flex-col items-start justify-between gap-3 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:flex-row sm:items-center">
        <p className="text-sm text-muted-foreground">
          No fue posible generar la vista previa del reporte.
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => report.refetch()}
        >
          <RotateCcwIcon data-icon="inline-start" />
          Reintentar
        </Button>
      </div>
    )
  }

  return <ReportPreview report={report.data} />
}

function ReportPreviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-xl bg-card p-6 ring-1 ring-foreground/10"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-8 w-14" />
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    </div>
  )
}

function getDownloadErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  return 'No se pudo generar el reporte PDF.'
}
