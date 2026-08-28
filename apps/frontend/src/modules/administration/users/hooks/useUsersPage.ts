import { useEffect } from 'react'
import { useQueryStates } from 'nuqs'

import { usePagination } from '@/hooks/usePagination'
import { userSearchParams } from '../queries/user-search-params'
import { useUsers } from './useUsers'

const userPageSizes = [10, 20, 25, 30] as const

export function useUsersPage() {
  const [filters, setFilters] = useQueryStates(userSearchParams)
  const pagination = usePagination({
    page: filters.page,
    limit: filters.limit,
    pageSizes: userPageSizes,
    onChange: (change) => void setFilters(change),
  })
  const usersQuery = useUsers({
    page: pagination.page,
    limit: pagination.limit,
  })
  const meta = usersQuery.data?.meta

  useEffect(() => {
    if (meta?.totalPages && pagination.page > meta.totalPages) {
      void setFilters({ page: meta.totalPages })
    }
  }, [meta?.totalPages, pagination.page, setFilters])

  return {
    usersQuery,
    meta,
    limit: pagination.limit,
    pageSizes: userPageSizes,
    setPageSize: pagination.setPageSize,
    goToPreviousPage: () => {
      if (meta) pagination.goToPreviousPage(meta)
    },
    goToNextPage: () => {
      if (meta) pagination.goToNextPage(meta)
    },
  }
}
