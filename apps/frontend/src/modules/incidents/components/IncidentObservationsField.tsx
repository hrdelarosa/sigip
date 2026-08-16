import {
  type Control,
  useFormState,
  useWatch,
  type UseFormRegister,
} from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { IncidentFormValues } from '../schemas/incident-form.schema'

export function IncidentObservationsField({
  control,
  register,
  disabled,
}: {
  control: Control<IncidentFormValues>
  register: UseFormRegister<IncidentFormValues>
  disabled?: boolean
}) {
  const { errors } = useFormState({ control, name: 'observations' })
  const observations = useWatch({ control, name: 'observations' }) ?? ''
  const length = observations.length

  return (
    <Field data-invalid={Boolean(errors.observations)} className="gap-1.5">
      <FieldLabel htmlFor="incident-observations">Observaciones</FieldLabel>
      <Textarea
        id="incident-observations"
        maxLength={5000}
        className="min-h-28 resize-none field-sizing-fixed"
        placeholder="Notas adicionales sobre la incidencia"
        disabled={disabled}
        aria-invalid={Boolean(errors.observations)}
        {...register('observations')}
      />
      <div className="flex items-center justify-between gap-2">
        <FieldError>{errors.observations?.message}</FieldError>
        <span className="text-xs text-muted-foreground tabular-nums">
          {length}/5000 caracteres
        </span>
      </div>
    </Field>
  )
}
