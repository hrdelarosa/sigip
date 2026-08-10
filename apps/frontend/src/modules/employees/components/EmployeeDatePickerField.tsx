import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

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
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              id={id}
              type="button"
              data-empty={!value}
              disabled={disabled}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorMessage ? errorId : undefined}
              className="w-full justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
            >
              {value ? (
                format(parseISO(value), 'PPP', { locale: es })
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
              <ChevronDown data-icon="inline-end" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            locale={es}
            selected={value ? parseISO(value) : undefined}
            captionLayout="dropdown"
            onSelect={(date) =>
              onChange(date ? format(date, 'yyyy-MM-dd') : '')
            }
          />
        </PopoverContent>
      </Popover>
      <FieldError id={errorId}>{errorMessage}</FieldError>
    </Field>
  )
}
