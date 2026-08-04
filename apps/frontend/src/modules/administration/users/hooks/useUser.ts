import { useQuery } from '@tanstack/react-query'
import { userDetailQueryOptions } from '../queries/user-query-options'

export function useUser(id: string | null) {
  return useQuery({
    ...userDetailQueryOptions(id ?? ''),
    enabled: id !== null,
  })
}
