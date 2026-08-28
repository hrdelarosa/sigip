import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createIncident } from '../api/incidents.api'
import { incidentQueryKeys } from '../queries/incident-query-keys'
import { employeeQueryKeys } from '@/modules/employees/queries/employee-query-keys'

export function useCreateIncident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createIncident,

    onSuccess: async (incident) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: incidentQueryKeys.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: employeeQueryKeys.detail(incident.employee.id),
        }),
      ])
    },
  })
}
