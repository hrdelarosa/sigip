import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createPosition } from '../api/positions.api'
import { positionQueryKeys } from '../queries/position-query-keys'

export function useCreatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPosition,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: positionQueryKeys.lists(),
      })
    },
  })
}
