import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEmployeeStatus } from '../api/employees.api'
import { employeeQueryKeys } from '../queries/employee-query-keys'
import { positionQueryKeys } from '@/modules/administration/positions/queries/position-query-keys'

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateEmployeeStatus,
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: employeeQueryKeys.detail(variables.id),
        }),
        queryClient.invalidateQueries({ queryKey: positionQueryKeys.details() }),
      ])
    },
  })
}
