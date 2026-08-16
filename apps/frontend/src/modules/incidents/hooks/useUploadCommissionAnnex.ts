import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { uploadCommissionAnnex } from '../api/incidents.api'
import { incidentQueryKeys } from '../queries/incident-query-keys'

export function useUploadCommissionAnnex(incidentId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => uploadCommissionAnnex({ incidentId, file }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: incidentQueryKeys.documents(incidentId),
      })
      toast.success('Oficio de comisión agregado')
    },
    onError: (error) => {
      toast.error('No se pudo agregar el oficio', {
        description: error instanceof Error ? error.message : 'Intente nuevamente.',
      })
    },
  })
}
