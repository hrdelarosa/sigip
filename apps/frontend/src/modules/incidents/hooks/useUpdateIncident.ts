import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateIncident } from '../api/incidents.api'
import { incidentQueryKeys } from '../queries/incident-query-keys'

export function useUpdateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateIncident,
    onSuccess: async (incident) => {
      queryClient.setQueryData(incidentQueryKeys.detail(incident.id), incident)
      await queryClient.invalidateQueries({
        queryKey: incidentQueryKeys.lists(),
      })
    },
  })
}
