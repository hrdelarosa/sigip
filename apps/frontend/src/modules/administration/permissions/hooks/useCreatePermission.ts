import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPermission } from '../api/permissions.api'
import { permissionQueryKeys } from '../queries/permission-query-keys'
import type { PermissionDetails } from '../types/permission.types'

export function useCreatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPermission,
    onSuccess: async (permission) => {
      queryClient.setQueryData<PermissionDetails>(
        permissionQueryKeys.detail(permission.id),
        {
          ...permission,
          assignmentCount: 0,
          roles: [],
        },
      )

      await queryClient.invalidateQueries({
        queryKey: permissionQueryKeys.lists(),
      })
    },
  })
}
