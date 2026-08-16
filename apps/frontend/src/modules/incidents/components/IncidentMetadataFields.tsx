import {
  type Control,
  Controller,
  useFormState,
  type UseFormRegister,
} from 'react-hook-form'

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { IncidentFormValues } from '../schemas/incident-form.schema'
import type { IncidentContextFieldsState } from './IncidentContextFields'
import { IncidentTypeField } from './IncidentContextFields'
import {
  IncidentDatePickerField,
  IncidentReceivedAtField,
} from './IncidentDatePickerField'

export function IncidentMetadataFields({
  control,
  register,
  disabled,
  context,
}: {
  control: Control<IncidentFormValues>
  register: UseFormRegister<IncidentFormValues>
  disabled?: boolean
  context: IncidentContextFieldsState
}) {
  const { errors } = useFormState({
    control,
    name: ['receivedAt', 'issuedDate', 'referenceYear'],
  })

  return (
    <div className="flex flex-col gap-5">
      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <IncidentTypeField
          control={control}
          disabled={disabled}
          context={context}
        />

        <Controller
          name="receivedAt"
          control={control}
          render={({ field }) => (
            <IncidentReceivedAtField
              id="incident-received-at"
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              errorMessage={errors.receivedAt?.message}
            />
          )}
        />
      </FieldGroup>

      <FieldDescription className="text-sm">
        Determina cómo se capturan las fechas.
      </FieldDescription>

      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Controller
          name="issuedDate"
          control={control}
          render={({ field }) => (
            <IncidentDatePickerField
              id="incident-issued-date"
              label={
                <>
                  Fecha de emisión{' '}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </>
              }
              value={field.value}
              onChange={(value) => field.onChange(value || null)}
              disabled={disabled}
              errorMessage={errors.issuedDate?.message}
              placeholder="Seleccione fecha"
            />
          )}
        />

        <Field data-invalid={Boolean(errors.referenceYear)} className="gap-1.5">
          <FieldLabel htmlFor="incident-reference-year">
            Año de referencia{' '}
            <span className="font-normal text-muted-foreground">(opcional)</span>
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
    </div>
  )
}
