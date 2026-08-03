import { useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  PermissionDetails,
  UpdatePermissionInput,
} from '../types/permission.types'
import { updatePermission } from '../api/permissions.api'
import { permissionQueryKeys } from '../queries/permission-query-keys'

interface UpdatePermissionVariables {
  id: string
  input: UpdatePermissionInput
}

export function useUpdatePermission() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdatePermissionVariables) =>
      updatePermission({ id, input }),
    onSuccess: async (permission) => {
      queryClient.setQueryData<PermissionDetails>(
        permissionQueryKeys.detail(permission.id),
        (currentPermission) =>
          currentPermission
            ? { ...currentPermission, ...permission }
            : currentPermission,
      )

      await queryClient.invalidateQueries({
        queryKey: permissionQueryKeys.lists(),
      })
    },
  })
}
