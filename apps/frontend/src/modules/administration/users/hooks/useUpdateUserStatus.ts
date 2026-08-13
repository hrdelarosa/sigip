import type { ChangeUserStatusRequest } from '@sigip/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserStatus } from '../api/users.api'
import { userQueryKeys } from '../queries/user-query-keys'

interface UpdateUserStatusVariables {
  id: string
  input: ChangeUserStatusRequest
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateUserStatusVariables) =>
      updateUserStatus({ id, input }),
    onSuccess: async (user) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(user.id) }),
        queryClient.invalidateQueries({
          queryKey: userQueryKeys.sessions(user.id),
        }),
      ])
    },
  })
}
