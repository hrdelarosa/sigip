import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateRole } from '../api/roles.api'
import { roleQueryKeys } from '../queries/role-query-keys'
import type {
  RolePermissionsResponse,
  UpdateRoleInput,
} from '../types/roles.types'

interface UpdateRoleVariables {
  id: string
  input: UpdateRoleInput
}

export function useUpdateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateRoleVariables) =>
      updateRole({ id, input }),
    onSuccess: async (role) => {
      queryClient.setQueryData(roleQueryKeys.detail(role.id), role)
      queryClient.setQueryData<RolePermissionsResponse>(
        roleQueryKeys.permissions(role.id),
        (current) => (current ? { ...current, role } : current),
      )

      await queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() })
    },
  })
}
