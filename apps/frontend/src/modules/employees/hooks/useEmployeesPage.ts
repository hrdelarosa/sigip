import { useQueryStates } from 'nuqs'
import { useEffect } from 'react'

import { usePagination } from '@/hooks/usePagination'
import { employeeSearchParams } from '../queries/employee-search-params'
import { useEmployees } from './useEmployees'

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const employeePageSizes = [10, 20, 25, 30] as const

function validUuid(value: string | null) {
  return value && uuidPattern.test(value) ? value : undefined
}

export function useEmployeesPage() {
  const [filters, setFilters] = useQueryStates(employeeSearchParams)
  const pagination = usePagination({
    page: filters.page,
    limit: filters.limit,
    search: filters.search,
    pageSizes: employeePageSizes,
    onChange: (change) => void setFilters(change),
  })
  const employeesQuery = useEmployees({
    page: pagination.page,
    limit: pagination.limit,
    search: pagination.search || undefined,
    sort: filters.sort ?? undefined,
    status: filters.status ?? undefined,
    organizationalUnitId: validUuid(filters.organizationalUnitId),
    positionId: validUuid(filters.positionId),
  })
  const meta = employeesQuery.data?.meta
  const totalPages = meta?.totalPages
  const hasFilters = Boolean(
    filters.search ||
      filters.sort ||
      filters.status ||
      filters.organizationalUnitId ||
      filters.positionId,
  )

  useEffect(() => {
    if (totalPages && pagination.page > totalPages) {
      void setFilters({ page: totalPages })
    }
  }, [pagination.page, setFilters, totalPages])

  return {
    employeesQuery,
    meta,
    limit: pagination.limit,
    pageSizes: employeePageSizes,
    hasFilters,
    setPageSize: pagination.setPageSize,
    goToPreviousPage: () => {
      if (meta) pagination.goToPreviousPage(meta)
    },
    goToNextPage: () => {
      if (meta) pagination.goToNextPage(meta)
    },
  }
}
