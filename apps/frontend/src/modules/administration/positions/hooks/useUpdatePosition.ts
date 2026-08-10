import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatePosition } from '../api/positions.api'
import { positionQueryKeys } from '../queries/position-query-keys'
import type { UpdatePositionInput } from '../types/positions.types'
import { employeeQueryKeys } from '@/modules/employees/queries/employee-query-keys'

interface UpdatePositionVariables {
  id: string
  input: UpdatePositionInput
}

export function useUpdatePosition() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdatePositionVariables) =>
      updatePosition({ id, input }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: positionQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: positionQueryKeys.detail(variables.id),
        }),
        queryClient.invalidateQueries({ queryKey: employeeQueryKeys.details() }),
      ])
    },
  })
}
