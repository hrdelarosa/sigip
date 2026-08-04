import { queryOptions } from '@tanstack/react-query'
import { roleQueryKeys } from './role-query-keys'
import { getRoleById, getRolePermissions, getRoles } from '../api/roles.api'

export const roleQueryOptions = () =>
  queryOptions({
    queryKey: roleQueryKeys.list(),
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

export const roleDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: roleQueryKeys.detail(id),
    queryFn: () => getRoleById({ id }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

export const rolePermissionsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: roleQueryKeys.permissions(id),
    queryFn: () => getRolePermissions({ id }),
    staleTime: 5 * 60 * 1000,
  })
