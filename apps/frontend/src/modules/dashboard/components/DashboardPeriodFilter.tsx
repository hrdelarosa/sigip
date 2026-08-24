import { Field, FieldLabel } from '@/components/ui/field'
import type { DashboardTrendPeriod } from '../hooks/useDashboardPage'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const options: Array<{ value: DashboardTrendPeriod; label: string }> = [
  { value: '3m', label: 'Últimos 3 meses' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: 'ytd', label: 'Este año' },
  { value: '12m', label: 'Últimos 12 meses' },
]

export function DashboardPeriodFilter({
  value,
  onChange,
}: {
  value: DashboardTrendPeriod
  onChange: (value: DashboardTrendPeriod) => void
}) {
  const selectedLabel = options.find((option) => option.value === value)?.label

  return (
    <Field className="w-full sm:w-auto">
      <FieldLabel htmlFor="report-period-trend" className="sr-only">
        Periodo de tendencia
      </FieldLabel>
      <Select
        items={options}
        value={value}
        onValueChange={(period) => {
          if (period) onChange(period)
        }}
      >
        <SelectTrigger id="report-period-trend" className="w-full sm:w-48">
          <SelectValue>{selectedLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
