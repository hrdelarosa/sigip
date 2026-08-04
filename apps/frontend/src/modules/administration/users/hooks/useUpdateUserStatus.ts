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
      queryClient.setQueryData(userQueryKeys.detail(user.id), user)
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
    },
  })
}
