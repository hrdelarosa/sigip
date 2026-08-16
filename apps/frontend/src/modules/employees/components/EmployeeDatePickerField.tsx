import { DatePicker } from '@/components/ui/date-picker'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'

interface Props {
  id: string
  label: string
  value: string | null | undefined
  onChange: (value: string) => void
  disabled?: boolean
  errorMessage?: string
  placeholder?: string
}

export function EmployeeDatePickerField({
  id,
  label,
  value,
  onChange,
  disabled = false,
  errorMessage,
  placeholder = 'Selecciona una fecha',
}: Props) {
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
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? errorId : undefined}
        buttonClassName="w-full"
      />
      <FieldError id={errorId}>{errorMessage}</FieldError>
    </Field>
  )
}
