import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export function IncidentDatePickerField({
  id,
  label,
  value,
  onChange,
  disabled = false,
  errorMessage,
  placeholder = 'Seleccione una fecha',
  disabledDates,
}: {
  id: string
  label: React.ReactNode
  value: string | null | undefined
  onChange: (value: string) => void
  disabled?: boolean
  errorMessage?: string
  placeholder?: string
  disabledDates?: React.ComponentProps<typeof DatePicker>['disabledDates']
}) {
  const errorId = `${id}-error`

  return (
    <Field data-invalid={Boolean(errorMessage)} className="gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <DatePicker
        id={id}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        disabledDates={disabledDates}
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? errorId : undefined}
        buttonClassName="w-full"
      />
      <FieldError id={errorId}>{errorMessage}</FieldError>
    </Field>
  )
}

function splitReceivedAt(value: string): { date: string; time: string } {
  if (!value) return { date: '', time: '' }

  const [date, timePart] = value.split('T')

  return { date, time: timePart?.slice(0, 5) ?? '' }
}

function combineReceivedAt(date: string, time: string): string {
  if (!date) return ''

  return `${date}T${time || '00:00'}`
}

export function IncidentReceivedAtField({
  id,
  value,
  onChange,
  disabled = false,
  errorMessage,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  errorMessage?: string
}) {
  const errorId = `${id}-error`
  const { date, time } = splitReceivedAt(value)

  return (
    <Field data-invalid={Boolean(errorMessage)} className="gap-1.5">
      <FieldLabel htmlFor={id}>Fecha y hora de recepción</FieldLabel>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,8rem)]">
        <DatePicker
          id={id}
          value={date}
          onValueChange={(nextDate) => onChange(combineReceivedAt(nextDate, time))}
          disabled={disabled}
          placeholder="Seleccione fecha"
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          buttonClassName="w-full"
        />
        <Input
          id={`${id}-time`}
          type="time"
          value={time}
          disabled={disabled || !date}
          aria-invalid={Boolean(errorMessage)}
          className="w-full"
          onChange={(event) =>
            onChange(combineReceivedAt(date, event.target.value))
          }
        />
      </div>
      <FieldError id={errorId}>{errorMessage}</FieldError>
    </Field>
  )
}
