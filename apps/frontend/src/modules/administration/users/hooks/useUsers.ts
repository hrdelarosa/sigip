import { useQuery } from '@tanstack/react-query'
import { userQueryOptions } from '../queries/user-query-options'

export function useUsers(params: { page: number; limit: number }) {
  return useQuery(userQueryOptions(params))
}
