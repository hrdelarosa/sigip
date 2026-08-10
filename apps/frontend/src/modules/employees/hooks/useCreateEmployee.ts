import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createEmployee } from '../api/employees.api'
import { employeeQueryKeys } from '../queries/employee-query-keys'

export function useCreateEmployee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: employeeQueryKeys.lists(),
      })
    },
  })
}
