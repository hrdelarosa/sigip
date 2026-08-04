import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRoleStatus } from '../api/roles.api'
import { permissionQueryKeys } from '../../permissions/queries/permission-query-keys'
import { roleQueryKeys } from '../queries/role-query-keys'
import type {
  RolePermissionsResponse,
  UpdateRoleStatusInput,
} from '../types/roles.types'

interface UpdateRoleStatusVariables {
  id: string
  input: UpdateRoleStatusInput
}

export function useUpdateRoleStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateRoleStatusVariables) =>
      updateRoleStatus({ id, input }),
    onSuccess: async (role) => {
      queryClient.setQueryData(roleQueryKeys.detail(role.id), role)
      queryClient.setQueryData<RolePermissionsResponse>(
        roleQueryKeys.permissions(role.id),
        (current) => (current ? { ...current, role } : current),
      )

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: permissionQueryKeys.details(),
        }),
      ])
    },
  })
}
