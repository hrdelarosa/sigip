import { queryOptions } from '@tanstack/react-query'
import { getOffices } from '../api/offices.api'
import { getOfficeById } from '../api/offices.api'
import { officeQueryKeys } from './office-query-keys'

export const officeQueryOptions = () =>
  queryOptions({
    queryKey: officeQueryKeys.list(),
    queryFn: getOffices,
    staleTime: 5 * 60 * 1000,
  })

export const officeDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: officeQueryKeys.detail(id),
    queryFn: () => getOfficeById({ id }),
  })
