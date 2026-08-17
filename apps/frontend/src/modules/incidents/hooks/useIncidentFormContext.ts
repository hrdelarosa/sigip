import type { Control, UseFormSetValue } from 'react-hook-form'

import type { IncidentFormValues } from '../schemas/incident-form.schema'
import type { Incident } from '../types/incident.types'
import { useIncidentContextFields } from './useIncidentContextFields'

export function useIncidentFormContext(
  control: Control<IncidentFormValues>,
  setValue: UseFormSetValue<IncidentFormValues>,
  incident?: Incident,
) {
  return useIncidentContextFields(control, setValue, incident)
}