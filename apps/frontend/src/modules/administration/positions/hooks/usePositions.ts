import { useQuery } from '@tanstack/react-query'
import { positionQueryOptions } from '../queries/position-query-options'

export function usePositions() {
  return useQuery(positionQueryOptions())
}
