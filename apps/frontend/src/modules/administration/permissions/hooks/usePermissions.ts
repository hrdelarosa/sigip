import { useQuery } from '@tanstack/react-query'
import { permissionQueryOptions } from '../queries/permission-query-options'

export function usePermissions() {
  return useQuery(permissionQueryOptions())
}
