import type { UpdateUserRequest } from '@sigip/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '../api/users.api'
import { userQueryKeys } from '../queries/user-query-keys'

interface UpdateUserVariables {
  id: string
  input: UpdateUserRequest
}

export function useUpdateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateUserVariables) =>
      updateUser({ id, input }),
    onSuccess: async (user) => {
      queryClient.setQueryData(userQueryKeys.detail(user.id), user)
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
    },
  })
}
