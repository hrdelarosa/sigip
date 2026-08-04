import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createRole } from '../api/roles.api'
import { roleQueryKeys } from '../queries/role-query-keys'
import type { RolePermissionsResponse } from '../types/roles.types'

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRole,
    onSuccess: async (role) => {
      queryClient.setQueryData(roleQueryKeys.detail(role.id), role)
      queryClient.setQueryData<RolePermissionsResponse>(
        roleQueryKeys.permissions(role.id),
        { role, permissions: [] },
      )

      await queryClient.invalidateQueries({ queryKey: roleQueryKeys.lists() })
    },
  })
}
