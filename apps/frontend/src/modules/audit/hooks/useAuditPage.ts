import { useEffect } from 'react'
import { useQueryStates } from 'nuqs'

import { usePagination } from '@/hooks/usePagination'
import { auditPageSizes } from '../constants/audit.constants'
import { auditSearchParams } from '../queries/audit-search-params'
import { useAuditLogs } from './useAudit'

export function useAuditPage() {
  const [filters, setFilters] = useQueryStates(auditSearchParams)
  const pagination = usePagination({
    page: filters.page,
    limit: filters.limit,
    pageSizes: auditPageSizes,
    onChange: (change) => void setFilters(change),
  })
  const auditQuery = useAuditLogs({
    page: pagination.page,
    limit: pagination.limit,
    action: filters.action ?? undefined,
    entityType: filters.entityType ?? undefined,
    entityId: filters.entityId ?? undefined,
    createdFrom: filters.createdFrom
      ? new Date(`${filters.createdFrom}T00:00:00`).toISOString()
      : undefined,
    createdTo: filters.createdTo
      ? new Date(`${filters.createdTo}T23:59:59.999`).toISOString()
      : undefined,
  })
  const meta = auditQuery.data?.meta

  useEffect(() => {
    if (meta?.totalPages && pagination.page > meta.totalPages) {
      void setFilters({ page: meta.totalPages })
    }
  }, [meta?.totalPages, pagination.page, setFilters])

  return {
    auditQuery,
    detailsId: filters.details,
    hasFilters: Boolean(
      filters.action ||
        filters.entityType ||
        filters.entityId ||
        filters.createdFrom ||
        filters.createdTo,
    ),
    limit: pagination.limit,
    meta,
    pageSizes: auditPageSizes,
    setPageSize: pagination.setPageSize,
    goToPreviousPage: () => {
      if (meta) pagination.goToPreviousPage(meta)
    },
    goToNextPage: () => {
      if (meta) pagination.goToNextPage(meta)
    },
    openDetails: (id: string) => void setFilters({ details: id }),
    closeDetails: () =>
      void setFilters({ details: null }, { history: 'replace' }),
  }
}
