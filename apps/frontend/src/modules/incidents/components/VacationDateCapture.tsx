import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FieldDescription, FieldError } from '@/components/ui/field'
import {
  buildVacationDateRange,
  MAX_VACATION_DAYS,
} from '../lib/vacation-date-range'
import { IncidentDatePickerField } from './IncidentDatePickerField'

export type VacationCaptureMode = 'INDIVIDUAL' | 'RANGE'

export function VacationDateCapture({
  captureMode,
  onCaptureModeChange,
  onDatesChange,
  occurrenceLimit,
  ordinaryVacation,
  occurrencesCount,
  disabled,
  disabledDates,
}: {
  captureMode: VacationCaptureMode
  onCaptureModeChange: (mode: VacationCaptureMode) => void
  onDatesChange: (dates: string[]) => void
  occurrenceLimit: number
  ordinaryVacation: boolean
  occurrencesCount: number
  disabled?: boolean
  disabledDates?: React.ComponentProps<
    typeof IncidentDatePickerField
  >['disabledDates']
}) {
  const [rangeStartDate, setRangeStartDate] = useState('')
  const [rangeEndDate, setRangeEndDate] = useState('')
  const [includeWeekends, setIncludeWeekends] = useState(false)
  const [rangeError, setRangeError] = useState('')

  const syncRange = (
    startDate: string,
    endDate: string,
    shouldIncludeWeekends: boolean,
  ) => {
    if (!startDate || !endDate) {
      onDatesChange([])
      setRangeError('Seleccione la fecha inicial y la fecha final')
      return
    }

    if (endDate < startDate) {
      onDatesChange([])
      setRangeError('La fecha final no puede ser anterior a la inicial')
      return
    }

    const dates = buildVacationDateRange(
      startDate,
      endDate,
      shouldIncludeWeekends,
    )

    if (dates.length === 0) {
      onDatesChange([])
      setRangeError('El rango no contiene días seleccionables')
      return
    }

    if (dates.length > occurrenceLimit) {
      onDatesChange([])
      setRangeError(
        ordinaryVacation
          ? `El rango contiene ${dates.length} días; el máximo por periodo es ${MAX_VACATION_DAYS}`
          : `El rango contiene más de ${occurrenceLimit} días`,
      )
      return
    }

    onDatesChange(dates)
    setRangeError('')
  }

  return (
    <div className="mb-5 grid gap-4 rounded-lg border bg-muted/20 p-4">
      <div>
        <div className="text-sm font-medium">Forma de captura</div>
        <div
          className="mt-2 flex w-full flex-col gap-2 sm:w-auto sm:flex-row"
          aria-label="Forma de captura de vacaciones"
          role="group"
        >
          <Button
            type="button"
            size="sm"
            variant={captureMode === 'INDIVIDUAL' ? 'default' : 'outline'}
            aria-pressed={captureMode === 'INDIVIDUAL'}
            onClick={() => onCaptureModeChange('INDIVIDUAL')}
            disabled={disabled}
          >
            Fechas individuales
          </Button>
          <Button
            type="button"
            size="sm"
            variant={captureMode === 'RANGE' ? 'default' : 'outline'}
            aria-pressed={captureMode === 'RANGE'}
            onClick={() => {
              onCaptureModeChange('RANGE')
              if (rangeStartDate && rangeEndDate) {
                syncRange(rangeStartDate, rangeEndDate, includeWeekends)
              } else {
                setRangeError('Seleccione la fecha inicial y la fecha final')
              }
            }}
            disabled={disabled}
          >
            Rango de fechas
          </Button>
        </div>
      </div>

      {captureMode === 'RANGE' ? (
        <div className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <IncidentDatePickerField
              id="vacation-range-start"
              label="Fecha inicial"
              value={rangeStartDate}
              onChange={(value) => {
                setRangeStartDate(value)
                syncRange(value, rangeEndDate, includeWeekends)
              }}
              disabled={disabled}
              disabledDates={disabledDates}
            />
            <IncidentDatePickerField
              id="vacation-range-end"
              label="Fecha final"
              value={rangeEndDate}
              onChange={(value) => {
                setRangeEndDate(value)
                syncRange(rangeStartDate, value, includeWeekends)
              }}
              disabled={disabled}
              disabledDates={disabledDates}
            />
          </div>

          <label
            htmlFor="vacation-include-weekends"
            className="flex cursor-pointer items-start gap-3 rounded-md border border-input bg-background px-4 py-3"
          >
            <Checkbox
              id="vacation-include-weekends"
              checked={includeWeekends}
              onCheckedChange={(checked) => {
                const nextIncludeWeekends = checked === true
                setIncludeWeekends(nextIncludeWeekends)
                syncRange(rangeStartDate, rangeEndDate, nextIncludeWeekends)
              }}
              disabled={disabled}
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium">
                Incluir fines de semana
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                Cuente sábados y domingos para personal que labora esos días.
              </span>
            </span>
          </label>

          <div className="flex flex-col gap-1">
            <FieldError>{rangeError}</FieldError>
            {!rangeError ? (
              <FieldDescription>
                El rango se convirtió en {occurrencesCount} días de vacaciones.
              </FieldDescription>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
