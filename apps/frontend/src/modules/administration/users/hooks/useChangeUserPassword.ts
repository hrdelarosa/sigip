import type { ChangeUserPasswordRequest } from '@sigip/shared'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { changeUserPassword } from '../api/users.api'
import { userQueryKeys } from '../queries/user-query-keys'

interface ChangeUserPasswordVariables {
  id: string
  input: ChangeUserPasswordRequest
}

export function useChangeUserPassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: ChangeUserPasswordVariables) =>
      changeUserPassword({ id, input }),
    onSuccess: async (user) => {
      queryClient.setQueryData(userQueryKeys.detail(user.id), user)
      await queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() })
    },
  })
}
