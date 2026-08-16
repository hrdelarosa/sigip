import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cancelIncident } from '../api/incidents.api'
import { incidentQueryKeys } from '../queries/incident-query-keys'

export function useCancelIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: cancelIncident,

    onSuccess: async (incident) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: incidentQueryKeys.lists(),
        }),

        queryClient.invalidateQueries({
          queryKey: incidentQueryKeys.detail(incident.id),
        }),
      ])
    },
  })
}
