import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateOrganizationalUnit } from '../api/organizational-units.api'
import { organizationalUnitQueryKeys } from '../queries/organizational-unit-query-keys'
import type { UpdateOrganizationalUnitInput } from '../types/organizational-units.types'
import { employeeQueryKeys } from '@/modules/employees/queries/employee-query-keys'

interface UpdateOrganizationalUnitVariables {
  id: string
  input: UpdateOrganizationalUnitInput
}

export function useUpdateOrganizationalUnit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateOrganizationalUnitVariables) =>
      updateOrganizationalUnit({ id, input }),
    onSuccess: async (organizationalUnit) => {
      queryClient.setQueryData(
        organizationalUnitQueryKeys.detail(organizationalUnit.id),
        organizationalUnit,
      )
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: organizationalUnitQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({ queryKey: employeeQueryKeys.details() }),
      ])
    },
  })
}
