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
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(user.id) }),
      ])
    },
  })
}
