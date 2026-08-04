import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser } from '../api/users.api'
import { userQueryKeys } from '../queries/user-query-keys'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createUser,
    onSuccess: async (user) => {
      queryClient.setQueryData(userQueryKeys.detail(user.id), user)
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
    },
  })
}
