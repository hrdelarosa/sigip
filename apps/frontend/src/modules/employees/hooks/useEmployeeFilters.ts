import { useEffect, useRef } from 'react'
import type { SortDirection, SortField } from '../types/filters-employee.types'
import type { EmployeeSort } from '../types/employee.types'
import { useQueryStates } from 'nuqs'
import { employeeSearchParams } from '../queries/employee-search-params'
import { useOrganizationalUnits } from '@/modules/administration/organizational-units/hooks/useOrganizationalUnits'
import { usePositions } from '@/modules/administration/positions/hooks/usePositions'

export default function useEmployeeFilters() {
  const [filters, setFilters] = useQueryStates(employeeSearchParams)
  const positionsQuery = usePositions()
  const unitsQuery = useOrganizationalUnits()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const sortField = (filters.sort?.replace('-', '') ?? 'fullName') as SortField
  const sortDirection: SortDirection = filters.sort?.startsWith('-')
    ? 'desc'
    : 'asc'
  const activeFilterCount = [
    filters.status,
    filters.positionId,
    filters.organizationalUnitId,
    filters.sort,
  ].filter(Boolean).length
  const positionItems = [
    { value: '', label: 'Todos los puestos' },
    ...(positionsQuery.data ?? []).map((position) => ({
      value: position.id,
      label: position.name,
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
    key: 'status' | 'organizationalUnitId' | 'positionId',
    value: string | null,
  ) {
    void setFilters({
      [key]: !value || value === 'ALL' ? null : value,
      page: 1,
    })
  }

  function updateSort(field: SortField, direction: SortDirection) {
    const sort = `${direction === 'desc' ? '-' : ''}${field}` as EmployeeSort
    void setFilters({ sort, page: 1 })
  }

  function updateSortField(value: string | null) {
    if (value) updateSort(value as SortField, sortDirection)
  }

  function updateSortDirection(value: string[]) {
    const direction = value[0] as SortDirection | undefined
    if (direction) updateSort(sortField, direction)
  }

  function clearFilters() {
    void setFilters({
      page: 1,
      sort: null,
      status: null,
      organizationalUnitId: null,
      positionId: null,
    })
  }

  return {
    filters,
    searchInputRef,
    sortField,
    sortDirection,
    activeFilterCount,
    positionItems,
    unitItems,
    positionsDisabled: positionsQuery.isPending || positionsQuery.isError,
    unitsDisabled: unitsQuery.isPending || unitsQuery.isError,
    updateSearch,
    updateFilter,
    updateSortField,
    updateSortDirection,
    clearFilters,
  }
}
