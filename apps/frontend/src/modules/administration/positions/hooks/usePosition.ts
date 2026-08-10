import { useQuery } from '@tanstack/react-query'
import { positionDetailQueryOptions } from '../queries/position-query-options'

export function usePosition(id: string | null) {
  return useQuery({
    ...positionDetailQueryOptions(id ?? ''),
    enabled: Boolean(id),
  })
}
