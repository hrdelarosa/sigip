import { CalendarDaysIcon, InfoIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import {
  type Control,
  Controller,
  useFieldArray,
  useFormState,
  useWatch,
} from 'react-hook-form'
import type { IncidentTemporalMode } from '@sigip/shared'
import type { IncidentFormValues } from '../schemas/incident-form.schema'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import {
  buildAssignmentDateConstraints,
} from '../lib/incident-date-constraints'
import { IncidentDatePickerField } from './IncidentDatePickerField'
import { isOrdinaryVacation, MAX_VACATION_DAYS } from '../lib/vacation-date-range'
import {
  VacationDateCapture,
  type VacationCaptureMode,
} from './VacationDateCapture'

function TemporalModeChip({
  active,
  children,
}: {
  active: boolean
  children: React.ReactNode
}) {
  return <Badge variant={active ? 'default' : 'secondary'}>{children}</Badge>
}

export function IncidentOccurrencesField({
  control,
  temporalMode,
  incidentTypeCode,
  configured,
  disabled,
}: {
  control: Control<IncidentFormValues>
  temporalMode: IncidentTemporalMode
  incidentTypeCode: string
  configured: boolean
  disabled?: boolean
}) {
  const { errors } = useFormState({ control, name: 'occurrences' })
  const assignmentEffectiveFrom = useWatch({
    control,
    name: 'assignmentEffectiveFrom',
  })
  const assignmentEffectiveTo = useWatch({
    control,
    name: 'assignmentEffectiveTo',
  })
  const occurrences = useWatch({ control, name: 'occurrences' })
  const disabledDates = buildAssignmentDateConstraints(
    assignmentEffectiveFrom,
    assignmentEffectiveTo,
  )
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: 'occurrences',
  })
  const multiple = temporalMode === 'MULTIPLE_DATES'
  const range = temporalMode === 'DATE_RANGE'
  const vacation = incidentTypeCode.startsWith('VACACIONES_')
  const ordinaryVacation = isOrdinaryVacation(incidentTypeCode)
  const occurrenceLimit = ordinaryVacation ? MAX_VACATION_DAYS : 366
  const [vacationCaptureMode, setVacationCaptureMode] =
    useState<VacationCaptureMode>('INDIVIDUAL')
  const temporalDescription = !configured
    ? 'La modalidad se define automáticamente al seleccionar el tipo de incidencia.'
    : multiple
      ? vacation
        ? 'Capture días separados o genere los días a partir de un rango.'
        : 'Agregue cada día por separado, incluso cuando sean consecutivos.'
      : range
        ? 'Capture el inicio y fin del periodo continuo.'
        : 'La incidencia ocurre en un solo día.'

  return (
    <FieldSet className="gap-5">
      <div className="flex flex-col">
        <FieldLegend className="text-sm font-medium">Modo temporal</FieldLegend>
        <div
          className="flex flex-wrap gap-2 mb-2"
          aria-label="Modalidad temporal configurada"
        >
          <TemporalModeChip active={configured && !multiple && !range}>
            Fecha única
          </TemporalModeChip>
          <TemporalModeChip active={configured && range}>
            Rango de fechas
          </TemporalModeChip>
          <TemporalModeChip active={configured && multiple}>
            Fechas múltiples
          </TemporalModeChip>
        </div>
        <FieldDescription>{temporalDescription}</FieldDescription>
      </div>

      {!configured ? (
        <Alert className="border-dashed bg-muted/30">
          <InfoIcon aria-hidden="true" />
          <AlertDescription>
            Seleccione una asignación y un tipo de incidencia para habilitar la
            captura de fechas dentro de su vigencia.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="">
          {multiple && vacation ? (
            <VacationDateCapture
              captureMode={vacationCaptureMode}
              onCaptureModeChange={setVacationCaptureMode}
              onDatesChange={(dates) =>
                replace(
                  dates.length
                    ? dates.map((startDate) => ({ startDate, endDate: null }))
                    : [{ startDate: '', endDate: null }],
                )
              }
              occurrenceLimit={occurrenceLimit}
              ordinaryVacation={ordinaryVacation}
              occurrencesCount={occurrences.length}
              disabled={disabled}
              disabledDates={disabledDates}
            />
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2 text-sm font-medium mb-1.5">
              <CalendarDaysIcon className="size-4" aria-hidden="true" />
              Fechas de aplicación
            </div>
            {multiple && (!vacation || vacationCaptureMode === 'INDIVIDUAL') ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ startDate: '', endDate: null })}
                disabled={disabled || fields.length >= occurrenceLimit}
              >
                <PlusIcon data-icon="inline-start" />
                Agregar fecha
              </Button>
            ) : null}
          </div>

          <FieldGroup
            className={`${multiple ? 'grid gap-3 sm:grid-cols-2' : 'grid gap-3'} ${vacation && vacationCaptureMode === 'RANGE' ? 'hidden' : ''} mb-3`}
          >
            {fields.map((field, index) => {
              const startError = errors.occurrences?.[index]?.startDate?.message
              const endError = errors.occurrences?.[index]?.endDate?.message

              return (
                <div
                  key={field.id}
                  className={cn(
                    'grid min-w-0 gap-3 rounded-lg border bg-muted/20 p-4',
                    range ? 'sm:grid-cols-2' : multiple ? '' : '',
                  )}
                >
                  <Controller
                    name={`occurrences.${index}.startDate`}
                    control={control}
                    render={({ field: startField }) => (
                      <IncidentDatePickerField
                        id={`incident-start-${index}`}
                        label={
                          multiple
                            ? `Fecha ${index + 1}`
                            : range
                              ? 'Fecha inicial'
                              : 'Fecha'
                        }
                        value={startField.value}
                        onChange={startField.onChange}
                        disabled={disabled}
                        errorMessage={startError}
                        disabledDates={disabledDates}
                      />
                    )}
                  />

                  {range ? (
                    <Controller
                      name={`occurrences.${index}.endDate`}
                      control={control}
                      render={({ field: endField }) => (
                        <IncidentDatePickerField
                          id={`incident-end-${index}`}
                          label="Fecha final"
                          value={endField.value}
                          onChange={(value) => endField.onChange(value || null)}
                          disabled={disabled}
                          errorMessage={endError}
                          disabledDates={disabledDates}
                        />
                      )}
                    />
                  ) : null}

                  {multiple && fields.length > 1 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="justify-self-end"
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
            {multiple ? (
              <span>
                {occurrences.filter((occurrence) => occurrence.startDate).length}
                {ordinaryVacation ? ` de ${MAX_VACATION_DAYS}` : ''} días capturados
              </span>
            ) : null}
          </div>
        </div>
      )}
    </FieldSet>
  )
}
