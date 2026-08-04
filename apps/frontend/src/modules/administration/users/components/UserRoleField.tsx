import type { Role } from '../../roles/types/roles.types'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  id: string
  roles: Role[]
  value: string
  onChange: (roleId: string) => void
  error?: string
  disabled?: boolean
}

export function UserRoleField({
  id,
  roles,
  value,
  onChange,
  error,
  disabled = false,
}: Props) {
  const items = roles.map((role) => ({
    label: role.isActive ? role.name : `${role.name} (inactivo)`,
    value: role.id,
  }))

  return (
    <Field data-invalid={!!error} data-disabled={disabled || undefined}>
      <FieldLabel htmlFor={id}>Rol</FieldLabel>
      <Select
        items={items}
        value={value || null}
        onValueChange={(nextValue) => onChange(nextValue ?? '')}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <SelectValue placeholder="Seleccione un rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}
