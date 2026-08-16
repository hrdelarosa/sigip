import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useQueryStates } from 'nuqs'

import { usePagination } from '@/hooks/usePagination'
import { incidentSearchParams } from '../queries/incident-search-params'
import { incidentQueryOptions } from '../queries/incident-query-options'

const incidentPageSizes = [10, 20, 25, 30] as const

export function useIncidentsPage() {
  const [filters, setFilters] = useQueryStates(incidentSearchParams)
  const pagination = usePagination({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    pageSizes: incidentPageSizes,
    onChange: (change) => void setFilters(change),
  })
  const incidentsQueryResult = useQuery(
    incidentQueryOptions({
      page: pagination.page,
      limit: pagination.limit,
      search: pagination.search || undefined,
      status: filters.status ?? undefined,
      employeeId: filters.employeeId ?? undefined,
      incidentTypeId: filters.incidentTypeId ?? undefined,
      organizationalUnitId: filters.organizationalUnitId ?? undefined,
      from: filters.from ?? undefined,
      to: filters.to ?? undefined,
    }),
  )
  const meta = incidentsQueryResult.data?.meta
  const totalPages = meta?.totalPages
  const hasFilters = Boolean(
    filters.search ||
      filters.status ||
      filters.employeeId ||
      filters.incidentTypeId ||
      filters.organizationalUnitId ||
      filters.from ||
      filters.to,
  )

  useEffect(() => {
    if (totalPages && pagination.page > totalPages) {
      void setFilters({ page: totalPages })
    }
  }, [pagination.page, setFilters, totalPages])

  return {
    incidentsQuery: incidentsQueryResult,
    meta,
    limit: pagination.limit,
    pageSizes: incidentPageSizes,
    hasFilters,
    setPageSize: pagination.setPageSize,
    goToPreviousPage: () => meta && pagination.goToPreviousPage(meta),
    goToNextPage: () => meta && pagination.goToNextPage(meta),
  }
}
