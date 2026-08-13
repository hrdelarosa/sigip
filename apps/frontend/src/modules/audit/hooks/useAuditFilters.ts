import { useEffect, useRef } from 'react'
import { useQueryStates } from 'nuqs'

import { auditSearchParams } from '../queries/audit-search-params'

export function useAuditFilters() {
  const [filters, setFilters] = useQueryStates(auditSearchParams)
  const entityInputRef = useRef<HTMLInputElement>(null)
  const activeFilterCount = [
    filters.action,
    filters.entityType,
    filters.entityId,
    filters.createdFrom || filters.createdTo,
  ].filter(Boolean).length

  useEffect(() => {
    function focusEntitySearch(event: KeyboardEvent) {
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        entityInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', focusEntitySearch)
    return () => window.removeEventListener('keydown', focusEntitySearch)
  }, [])

  function updateEntityId(entityId: string) {
    void setFilters({ entityId: entityId || null, page: 1 })
  }

  function updateFilter(key: 'action' | 'entityType', value: string | null) {
    void setFilters({ [key]: value || null, page: 1 })
  }

  function updateDateFilter(
    key: 'createdFrom' | 'createdTo',
    value: string,
  ) {
    void setFilters({ [key]: value || null, page: 1 })
  }

  function clearFilters() {
    void setFilters({
      page: 1,
      action: null,
      entityType: null,
      entityId: null,
      createdFrom: null,
      createdTo: null,
    })
  }

  return {
    filters,
    entityInputRef,
    activeFilterCount,
    updateEntityId,
    updateFilter,
    updateDateFilter,
    clearFilters,
  }
}
