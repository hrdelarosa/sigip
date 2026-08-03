import { queryOptions } from '@tanstack/react-query'
import { permissionQueryKeys } from './permission-query-keys'
import { getPermissionById, getPermissions } from '../api/permissions.api'

export const permissionQueryOptions = () =>
  queryOptions({
    queryKey: permissionQueryKeys.list(),
    queryFn: getPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

export const permissionDetailQueryOptions = (id: string) =>
  queryOptions({
    queryKey: permissionQueryKeys.detail(id),
    queryFn: () => getPermissionById({ id }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
