import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createOrganizationalUnit } from '../api/organizational-units.api'
import { organizationalUnitQueryKeys } from '../queries/organizational-unit-query-keys'

export function useCreateOrganizationalUnits() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrganizationalUnit,
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
