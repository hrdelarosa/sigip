import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEmployeeAssignment } from '../api/employees.api'
import { employeeQueryKeys } from '../queries/employee-query-keys'
import { positionQueryKeys } from '@/modules/administration/positions/queries/position-query-keys'

export function useCreateEmployeeAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployeeAssignment,
    onSuccess: async (assignment, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: employeeQueryKeys.detail(variables.employeeId),
        }),
        queryClient.invalidateQueries({
          queryKey: positionQueryKeys.detail(assignment.positionId),
        }),
      ])
    },
  })
}
