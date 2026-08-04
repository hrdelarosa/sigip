import { useMutation, useQueryClient } from '@tanstack/react-query'
import { replaceRolePermissions } from '../api/roles.api'
import { permissionQueryKeys } from '../../permissions/queries/permission-query-keys'
import { roleQueryKeys } from '../queries/role-query-keys'
import type {
  ReplaceRolePermissionsInput,
  RolePermissionsResponse,
} from '../types/roles.types'

interface ReplaceRolePermissionsVariables {
  id: string
  input: ReplaceRolePermissionsInput
}

export function useReplaceRolePermissions() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: ReplaceRolePermissionsVariables) =>
      replaceRolePermissions({ id, input }),
    onSuccess: async (permissions, { id }) => {
      queryClient.setQueryData<RolePermissionsResponse>(
        roleQueryKeys.permissions(id),
        (current) => (current ? { ...current, permissions } : current),
      )

      await queryClient.invalidateQueries({
        queryKey: permissionQueryKeys.details(),
      })
    },
  })
}
