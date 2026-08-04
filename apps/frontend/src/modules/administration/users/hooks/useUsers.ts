import { useQuery } from '@tanstack/react-query'
import { userQueryOptions } from '../queries/user-query-options'

export function useUsers() {
  return useQuery(userQueryOptions())
}
