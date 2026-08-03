import { useQuery } from '@tanstack/react-query'
import { permissionDetailQueryOptions } from '../queries/permission-query-options'

export function usePermission(id: string | null) {
  return useQuery({
    ...permissionDetailQueryOptions(id ?? ''),
    enabled: Boolean(id),
  })
}
