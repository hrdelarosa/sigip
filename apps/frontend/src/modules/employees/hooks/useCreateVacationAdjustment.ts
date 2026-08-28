import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEmployeeVacationAdjustment } from '../api/employees.api'
import { employeeQueryKeys } from '../queries/employee-query-keys'

export function useCreateVacationAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployeeVacationAdjustment,
    onSuccess: async (_adjustment, variables) => {
      await queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.detail(variables.employeeId),
      })
    },
  })
}
