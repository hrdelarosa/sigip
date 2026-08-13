import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

interface Props extends React.ComponentProps<typeof InputGroupInput> {
  label: string
  error?: string
}

export function PasswordInput({ label, error, ...props }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  const errorId = error && props.id ? `${props.id}-error` : undefined

  return (
    <Field className="gap-1.5" data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={props.id}>{label}</FieldLabel>
      <InputGroup>
        <InputGroupInput
          {...props}
          type={isVisible ? 'text' : 'password'}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
        />
        <InputGroupAddon align="inline-end">
          <Button
            variant="ghost"
            size="icon-xs"
            type="button"
            disabled={props.disabled}
            aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={isVisible}
            onClick={() => setIsVisible((current) => !current)}
          >
            {isVisible ? (
              <EyeOffIcon aria-hidden="true" />
            ) : (
              <EyeIcon aria-hidden="true" />
            )}
          </Button>
        </InputGroupAddon>
      </InputGroup>
      <FieldError id={errorId}>{error}</FieldError>
    </Field>
  )
}
