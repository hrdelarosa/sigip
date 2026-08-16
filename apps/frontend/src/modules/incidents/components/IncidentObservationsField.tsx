import { useFormContext } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import type { IncidentFormValues } from '../schemas/incident-form.schema'

export function IncidentObservationsField({ disabled }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<IncidentFormValues>()

  return (
    <Field data-invalid={Boolean(errors.observations)} className="gap-1.5">
      <FieldLabel htmlFor="incident-observations">Observaciones</FieldLabel>
      <Textarea
        id="incident-observations"
        maxLength={5000}
        className="h-22 resize-none field-sizing-fixed"
        placeholder="Notas adicionales sobre la incidencia"
        disabled={disabled}
        aria-invalid={Boolean(errors.observations)}
        {...register('observations')}
      />
      <FieldError>{errors.observations?.message}</FieldError>
    </Field>
  )
}
