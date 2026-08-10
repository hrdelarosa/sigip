import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateOrganizationalUnitStatusInput } from '../types/organizational-units.types'
import { updateOrganizationalUnitStatus } from '../api/organizational-units.api'
import { organizationalUnitQueryKeys } from '../queries/organizational-unit-query-keys'

interface UpdateOrganizationalUnitStatusVariables {
  id: string
  input: UpdateOrganizationalUnitStatusInput
}

export function useUpdateOrganizationalUnitsStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateOrganizationalUnitStatusVariables) =>
      updateOrganizationalUnitStatus({ id, input }),
    onSuccess: async (organizationalUnit) => {
      queryClient.setQueryData(
        organizationalUnitQueryKeys.detail(organizationalUnit.id),
        organizationalUnit,
      )
      await queryClient.invalidateQueries({
        queryKey: organizationalUnitQueryKeys.lists(),
      })
    },
  })
}
