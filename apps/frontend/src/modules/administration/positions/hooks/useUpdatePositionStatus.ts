import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdatePositionStatusInput } from '../types/positions.types'
import { updatePositionStatus } from '../api/positions.api'
import { positionQueryKeys } from '../queries/position-query-keys'

interface UpdatePositionStatusVariables {
  id: string
  input: UpdatePositionStatusInput
}

export function useUpdatePositionStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdatePositionStatusVariables) =>
      updatePositionStatus({ id, input }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: positionQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: positionQueryKeys.detail(variables.id),
        }),
      ])
    },
  })
}
