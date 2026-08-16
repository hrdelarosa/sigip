import { useFormContext } from 'react-hook-form'

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { IncidentFormValues } from '../schemas/incident-form.schema'

export function IncidentMetadataFields({ disabled }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
  } = useFormContext<IncidentFormValues>()

  return (
    <FieldGroup className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      <Field data-invalid={Boolean(errors.receivedAt)} className="gap-1.5">
        <FieldLabel htmlFor="incident-received-at">Recepción en RH</FieldLabel>
        <Input
          id="incident-received-at"
          type="datetime-local"
          disabled={disabled}
          aria-invalid={Boolean(errors.receivedAt)}
          {...register('receivedAt')}
        />
        <FieldError>{errors.receivedAt?.message}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.issuedDate)} className="gap-1.5">
        <FieldLabel htmlFor="incident-issued-date">
          Fecha de emisión{' '}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </FieldLabel>
        <Input
          id="incident-issued-date"
          type="date"
          disabled={disabled}
          aria-invalid={Boolean(errors.issuedDate)}
          {...register('issuedDate')}
        />
        <FieldError>{errors.issuedDate?.message}</FieldError>
      </Field>

      <Field data-invalid={Boolean(errors.referenceYear)} className="gap-1.5">
        <FieldLabel htmlFor="incident-reference-year">
          Año de referencia
        </FieldLabel>
        <Input
          id="incident-reference-year"
          type="number"
          min={2000}
          max={2100}
          inputMode="numeric"
          placeholder="Ej. 2026"
          disabled={disabled}
          aria-invalid={Boolean(errors.referenceYear)}
          {...register('referenceYear')}
        />
        <FieldError>{errors.referenceYear?.message}</FieldError>
      </Field>
    </FieldGroup>
  )
}
