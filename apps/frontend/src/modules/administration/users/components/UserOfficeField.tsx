import type { Office } from '../../offices/types/office.types'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function UserOfficeField({ id, offices, value, onChange, error, disabled = false }: {
  id: string
  offices: Office[]
  value: string
  onChange: (officeId: string) => void
  error?: string
  disabled?: boolean
}) {
  return (
    <Field data-invalid={!!error} data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id}>Oficina</FieldLabel>
      <Select items={offices.map((office) => ({ label: `${office.code} · ${office.name}`, value: office.id }))} value={value || null} onValueChange={(nextValue) => onChange(nextValue ?? '')} disabled={disabled}>
        <SelectTrigger id={id} className="w-full" aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}>
          <SelectValue placeholder="Seleccione una oficina" />
        </SelectTrigger>
        <SelectContent>
          {offices.map((office) => <SelectItem key={office.id} value={office.id}>{office.code} · {office.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}
