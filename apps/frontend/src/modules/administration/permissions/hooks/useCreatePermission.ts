import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPermission } from '../api/permissions.api'
import { permissionQueryKeys } from '../queries/permission-query-keys'

export function useCreatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPermission,
    onSuccess: async (permission) => {
      queryClient.setQueryData(
        permissionQueryKeys.detail(permission.id),
        permission,
      )

      await queryClient.invalidateQueries({
        queryKey: permissionQueryKeys.lists(),
      })
    },
  })
}
