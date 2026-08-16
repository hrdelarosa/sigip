import { toast } from 'sonner'

import {
  getErrorMessage,
  toIncidentCreateRequest,
  toIncidentUpdateRequest,
} from '../lib/incident-form-helpers'
import type { IncidentFormValues } from '../schemas/incident-form.schema'
import type { Incident } from '../types/incident.types'
import { useCreateIncident } from './useCreateIncident'
import { useUpdateIncident } from './useUpdateIncident'

export function useIncidentSubmit(
  incident: Incident | undefined,
  onSuccess: (incident: Incident) => void,
) {
  const createMutation = useCreateIncident()
  const updateMutation = useUpdateIncident()
  const isPending = createMutation.isPending || updateMutation.isPending

  async function submit(values: IncidentFormValues) {
    if (!incident) {
      const file = values.file
      if (!file) return

      try {
        const created = await createMutation.mutateAsync({
          input: toIncidentCreateRequest(values),
          file,
          commissionAnnex: values.commissionAnnex ?? undefined,
        })
        toast.success('Incidencia registrada', {
          description: `El formato de ${created.employee.fullName} quedó resguardado.`,
        })
        onSuccess(created)
      } catch (error) {
        toast.error('No se pudo registrar la incidencia', {
          description: getErrorMessage(error),
        })
      }
      return
    }

    try {
      const updated = await updateMutation.mutateAsync({
        id: incident.id,
        input: toIncidentUpdateRequest(values),
      })
      toast.success('Incidencia actualizada', {
        description: 'Los cambios se guardaron correctamente.',
      })
      onSuccess(updated)
    } catch (error) {
      toast.error('No se pudo actualizar la incidencia', {
        description: getErrorMessage(error),
      })
    }
  }

  return {
    isPending,
    submit,
  }
}