import type { PaginationMeta } from '@sigip/shared'
import { useDebounce } from 'use-debounce'

interface PaginationChange {
  page?: number
  limit?: number
}

interface UsePaginationOptions {
  page: number
  limit: number
  search?: string
  pageSizes?: readonly number[]
  defaultLimit?: number
  debounceMs?: number
  maxSearchLength?: number
  onChange: (change: PaginationChange) => void
}

export function usePagination({
  page,
  limit,
  search = '',
  pageSizes = [10, 20, 25, 30],
  defaultLimit = 20,
  debounceMs = 500,
  maxSearchLength = 200,
  onChange,
}: UsePaginationOptions) {
  const [debouncedSearch] = useDebounce(search, debounceMs)
  const normalizedPage = Math.max(page, 1)
  const normalizedLimit = pageSizes.includes(limit) ? limit : defaultLimit

  function setPageSize(value: string | null) {
    const nextLimit = Number(value)
    if (pageSizes.includes(nextLimit)) onChange({ limit: nextLimit, page: 1 })
  }

  function goToPreviousPage(meta: PaginationMeta) {
    if (meta.hasPreviousPage) onChange({ page: meta.page - 1 })
  }

  function goToNextPage(meta: PaginationMeta) {
    if (meta.hasNextPage) onChange({ page: meta.page + 1 })
  }

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    search: debouncedSearch.slice(0, maxSearchLength),
    setPageSize,
    goToPreviousPage,
    goToNextPage,
  }
}
