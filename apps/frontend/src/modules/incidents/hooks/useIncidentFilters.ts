import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useQueryStates } from 'nuqs'

import { useOrganizationalUnits } from '@/modules/administration/organizational-units/hooks/useOrganizationalUnits'
import { incidentSearchParams } from '../queries/incident-search-params'
import { incidentTypesQueryOptions } from '../queries/incident-query-options'

export function useIncidentFilters() {
  const [filters, setFilters] = useQueryStates(incidentSearchParams)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const typesQuery = useQuery(
    incidentTypesQueryOptions({ page: 1, limit: 100, isActive: true }),
  )
  const unitsQuery = useOrganizationalUnits()
  const activeFilterCount = [
    filters.status,
    filters.employeeId,
    filters.incidentTypeId,
    filters.organizationalUnitId,
    filters.from || filters.to,
  ].filter(Boolean).length
  const typeItems = [
    { value: '', label: 'Todos los tipos' },
    ...(typesQuery.data?.items ?? []).map((type) => ({
      value: type.id,
      label: type.name,
    })),
  ]
  const unitItems = [
    { value: '', label: 'Todas las unidades' },
    ...(unitsQuery.data ?? []).map((unit) => ({
      value: unit.id,
      label: unit.name,
    })),
  ]

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if (event.ctrlKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  function updateSearch(search: string) {
    void setFilters({ search: search || null, page: 1 })
  }

  function updateFilter(
    key: 'status' | 'incidentTypeId' | 'organizationalUnitId',
    value: string | null,
  ) {
    void setFilters({ [key]: value || null, page: 1 })
  }

  function updateDateFilter(key: 'from' | 'to', value: string) {
    void setFilters({ [key]: value || null, page: 1 })
  }

  function clearFilters() {
    void setFilters({
      page: 1,
      status: null,
      employeeId: null,
      incidentTypeId: null,
      organizationalUnitId: null,
      from: null,
      to: null,
    })
  }

  return {
    filters,
    searchInputRef,
    activeFilterCount,
    typeItems,
    unitItems,
    typesDisabled: typesQuery.isPending || typesQuery.isError,
    unitsDisabled: unitsQuery.isPending || unitsQuery.isError,
    updateSearch,
    updateFilter,
    updateDateFilter,
    clearFilters,
  }
}
