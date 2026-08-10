import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateEmployeeAssignment } from '../api/employees.api'
import { employeeQueryKeys } from '../queries/employee-query-keys'
import { positionQueryKeys } from '@/modules/administration/positions/queries/position-query-keys'
import type { UpdateEmployeeAssignmentInput } from '../types/employee.types'

interface UpdateAssignmentVariables {
  employeeId: string
  assignmentId: string
  previousPositionId: string
  input: UpdateEmployeeAssignmentInput
}

export function useUpdateEmployeeAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (variables: UpdateAssignmentVariables) =>
      updateEmployeeAssignment({
        employeeId: variables.employeeId,
        assignmentId: variables.assignmentId,
        input: variables.input,
      }),
    onSuccess: async (assignment, variables) => {
      const positionIds = new Set([
        assignment.positionId,
        variables.previousPositionId,
      ])

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: employeeQueryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: employeeQueryKeys.detail(variables.employeeId),
        }),
        ...Array.from(positionIds, (positionId) =>
          queryClient.invalidateQueries({
            queryKey: positionQueryKeys.detail(positionId),
          }),
        ),
      ])
    },
  })
}
