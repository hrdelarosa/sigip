import { queryOptions } from '@tanstack/react-query'

import {
  getOrganizationalUnitById,
  getOrganizationalUnits,
} from '../api/organizational-units.api'
import { organizationalUnitQueryKeys } from './organizational-unit-query-keys'

const staleTime = 5 * 60 * 1000

export const organizationalUnitQueryOptions = () =>
  queryOptions({
    queryKey: organizationalUnitQueryKeys.list(),
    queryFn: getOrganizationalUnits,
    staleTime,
  })

export const organizationalUnitDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: organizationalUnitQueryKeys.detail(id),
    queryFn: () => getOrganizationalUnitById({ id }),
    staleTime,
  })
