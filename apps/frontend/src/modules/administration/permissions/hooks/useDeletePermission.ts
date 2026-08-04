import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePermission } from '../api/permissions.api'
import { permissionQueryKeys } from '../queries/permission-query-keys'

export function useDeletePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deletePermission,
    onSuccess: async (_, { id }) => {
      queryClient.removeQueries({
        queryKey: permissionQueryKeys.detail(id),
        exact: true,
      })

      await queryClient.invalidateQueries({
        queryKey: permissionQueryKeys.lists(),
      })
    },
  })
}
