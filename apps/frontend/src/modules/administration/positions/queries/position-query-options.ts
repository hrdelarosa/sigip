import { queryOptions } from '@tanstack/react-query'

import { getPositionById, getPositions } from '../api/positions.api'
import { positionQueryKeys } from './position-query-keys'

const staleTime = 5 * 60 * 1000

export const positionQueryOptions = () =>
  queryOptions({
    queryKey: positionQueryKeys.list(),
    queryFn: getPositions,
    staleTime,
  })

export const positionDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: positionQueryKeys.detail(id),
    queryFn: () => getPositionById({ id }),
    staleTime,
  })
