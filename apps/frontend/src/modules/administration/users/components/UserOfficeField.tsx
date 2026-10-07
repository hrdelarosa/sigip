import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function UserOfficeField({ id, offices, value, onChange, error, disabled = false, nameOnly = false }: {
  id: string
  offices: Array<Pick<import('@sigip/shared').OfficeResponse, 'id' | 'name' | 'code'>>
  value: string
  onChange: (officeId: string) => void
  error?: string
  disabled?: boolean
  nameOnly?: boolean
}) {
  const officeLabel = (office: { name: string; code: string }) => nameOnly ? office.name : `${office.code} · ${office.name}`
  return (
    <Field data-invalid={!!error} data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id}>Oficina</FieldLabel>
      <Select items={offices.map((office) => ({ label: officeLabel(office), value: office.id }))} value={value || null} onValueChange={(nextValue) => onChange(nextValue ?? '')} disabled={disabled}>
        <SelectTrigger id={id} className="w-full" aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}>
          <SelectValue placeholder="Seleccione una oficina" />
        </SelectTrigger>
        <SelectContent>
          {offices.map((office) => <SelectItem key={office.id} value={office.id}>{officeLabel(office)}</SelectItem>)}
        </SelectContent>
      </Select>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}
