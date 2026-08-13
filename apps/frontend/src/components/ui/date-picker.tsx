import { CalendarIcon, ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'
import { es } from 'date-fns/locale'
import { format, isValid, parseISO } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface DatePickerProps {
  id: string
  value: string | null | undefined
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  disabledDates?: React.ComponentProps<typeof Calendar>['disabled']
  'aria-invalid'?: boolean
  'aria-describedby'?: string
  buttonClassName?: string
}

export function DatePicker({
  id,
  value,
  onValueChange,
  placeholder = 'Selecciona una fecha',
  disabled = false,
  disabledDates,
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
  buttonClassName,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const parsedValue = value ? parseISO(value) : undefined
  const selected = parsedValue && isValid(parsedValue) ? parsedValue : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            id={id}
            type="button"
            data-empty={!selected}
            disabled={disabled}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
            className={`${buttonClassName ? buttonClassName : 'max-w-66'} w-full justify-start px-2.5 text-left font-normal data-[empty=true]:text-muted-foreground`}
          />
        }
      >
        <CalendarIcon data-icon="inline-start" />
        <span className="truncate">
          {selected ? format(selected, 'PPP', { locale: es }) : placeholder}
        </span>
        <ChevronDownIcon data-icon="inline-end" className="ml-auto" />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={es}
          selected={selected}
          defaultMonth={selected}
          captionLayout="dropdown"
          disabled={disabledDates}
          onSelect={(date) => {
            onValueChange(date ? format(date, 'yyyy-MM-dd') : '')
            if (date) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
