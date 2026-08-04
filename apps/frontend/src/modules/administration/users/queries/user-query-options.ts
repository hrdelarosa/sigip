import { queryOptions } from '@tanstack/react-query'
import { getUserById, getUsers } from '../api/users.api'
import { userQueryKeys } from './user-query-keys'

export const userQueryOptions = () =>
  queryOptions({
    queryKey: userQueryKeys.list(),
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000,
  })

export const userDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => getUserById({ id }),
    staleTime: 5 * 60 * 1000,
  })
