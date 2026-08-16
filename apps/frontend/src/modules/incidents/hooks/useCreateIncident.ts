import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createIncident } from '../api/incidents.api'
import { incidentQueryKeys } from '../queries/incident-query-keys'

export function useCreateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIncident,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: incidentQueryKeys.lists(),
      })
    },
  })
}
