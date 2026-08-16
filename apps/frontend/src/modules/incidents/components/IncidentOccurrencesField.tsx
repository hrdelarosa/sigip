import { CalendarDaysIcon, InfoIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useFieldArray, useFormContext, useFormState } from 'react-hook-form'
import type { IncidentTemporalMode } from '@sigip/shared'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { IncidentFormValues } from '../schemas/incident-form.schema'

export function IncidentOccurrencesField({
  temporalMode,
  configured,
  disabled,
}: {
  temporalMode: IncidentTemporalMode
  configured: boolean
  disabled?: boolean
}) {
  const { control, register } = useFormContext<IncidentFormValues>()
  const { errors } = useFormState({ control, name: 'occurrences' })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'occurrences',
  })
  const multiple = temporalMode === 'MULTIPLE_DATES'
  const range = temporalMode === 'DATE_RANGE'

  return (
    <FieldSet>
      <FieldLegend>Modo temporal</FieldLegend>
      <div
        className="flex flex-wrap gap-2"
        aria-label="Modalidad temporal configurada"
      >
        <Badge variant={configured && !multiple && !range ? 'default' : 'outline'}>
          Fecha única
        </Badge>
        <Badge variant={configured && range ? 'default' : 'outline'}>
          Rango de fechas
        </Badge>
        <Badge variant={configured && multiple ? 'default' : 'outline'}>
          Fechas múltiples
        </Badge>
      </div>
      <FieldDescription>
        {configured
          ? multiple
            ? 'Agregue cada día por separado, incluso cuando sean consecutivos.'
            : range
              ? 'Capture el inicio y fin del periodo continuo.'
              : 'La incidencia ocurre en un solo día.'
          : 'La modalidad se define automáticamente al seleccionar el tipo de incidencia.'}
      </FieldDescription>

      {!configured ? (
        <Alert className="border-dashed bg-muted/20">
          <InfoIcon aria-hidden="true" />
          <AlertDescription>
            Seleccione una asignación y un tipo de incidencia para habilitar la
            captura de fechas dentro de su vigencia.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <CalendarDaysIcon aria-hidden="true" />
              Fechas de aplicación
            </div>
            {multiple ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ startDate: '', endDate: null })}
                disabled={disabled || fields.length >= 366}
              >
                <PlusIcon data-icon="inline-start" />
                Agregar fecha
              </Button>
            ) : null}
          </div>

          <FieldGroup
            className={multiple ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3'}
          >
            {fields.map((field, index) => {
              const startError = errors.occurrences?.[index]?.startDate?.message
              const endError = errors.occurrences?.[index]?.endDate?.message

              return (
                <div
                  key={field.id}
                  className="grid min-w-0 gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2"
                >
                  <Field
                    data-invalid={Boolean(startError)}
                    className="min-w-0 gap-1.5"
                  >
                    <FieldLabel htmlFor={`incident-start-${index}`}>
                      {multiple
                        ? `Fecha ${index + 1}`
                        : range
                          ? 'Fecha inicial'
                          : 'Fecha'}
                    </FieldLabel>
                    <Input
                      id={`incident-start-${index}`}
                      type="date"
                      disabled={disabled}
                      aria-invalid={Boolean(startError)}
                      {...register(`occurrences.${index}.startDate`)}
                    />
                    <FieldError>{startError}</FieldError>
                  </Field>

                  {range ? (
                    <Field
                      data-invalid={Boolean(endError)}
                      className="min-w-0 gap-1.5"
                    >
                      <FieldLabel htmlFor={`incident-end-${index}`}>
                        Fecha final
                      </FieldLabel>
                      <Input
                        id={`incident-end-${index}`}
                        type="date"
                        disabled={disabled}
                        aria-invalid={Boolean(endError)}
                        {...register(`occurrences.${index}.endDate`)}
                      />
                      <FieldError>{endError}</FieldError>
                    </Field>
                  ) : null}

                  {multiple && fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="justify-self-end sm:col-start-2"
                      onClick={() => remove(index)}
                      disabled={disabled}
                      aria-label={`Quitar fecha ${index + 1}`}
                    >
                      <Trash2Icon />
                    </Button>
                  ) : null}
                </div>
              )
            })}
          </FieldGroup>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <FieldError>
              {errors.occurrences?.root?.message || errors.occurrences?.message}
            </FieldError>
            {multiple ? <span>{fields.length} días capturados</span> : null}
          </div>
        </>
      )}
    </FieldSet>
  )
}
