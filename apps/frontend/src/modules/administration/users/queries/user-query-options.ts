import { queryOptions } from '@tanstack/react-query'
import { getUserById, getUsers } from '../api/users.api'
import { getUserSessions } from '../api/user-sessions.api'
import { userQueryKeys } from './user-query-keys'

export const userQueryOptions = (params: { page: number; limit: number }) =>
  queryOptions({
    queryKey: userQueryKeys.list(params),
    queryFn: () => getUsers(params),
    staleTime: 5 * 60 * 1000,
  })

export const userDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: userQueryKeys.detail(id),
    queryFn: () => getUserById({ id }),
    staleTime: 5 * 60 * 1000,
  })

export const userSessionsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: userQueryKeys.sessions(userId),
    queryFn: ({ signal }) => getUserSessions({ userId, signal }),
    staleTime: 30_000,
  })
