import { FileTextIcon, UploadCloudIcon, XIcon } from 'lucide-react'
import { useRef } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import type { IncidentFormValues } from '../schemas/incident-form.schema'

export function IncidentFileField({
  disabled,
  name = 'file',
  id = 'incident-file',
  label = 'Formato de incidencia',
  description = 'PDF institucional obligatorio, con un tamaño máximo de 10 MB.',
  prompt = 'Seleccionar formato PDF',
}: {
  disabled?: boolean
  name?: 'file' | 'commissionAnnex'
  id?: string
  label?: string
  description?: string
  prompt?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { control } = useFormContext<IncidentFormValues>()
  const { field, fieldState } = useController({ control, name })
  const file = field.value

  function clearFile() {
    field.onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <Field data-invalid={fieldState.invalid} className="gap-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      <div className="rounded-lg border border-dashed bg-muted/20 p-4">
        {file ? (
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileTextIcon className="shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={clearFile}
              disabled={disabled}
              aria-label="Quitar PDF seleccionado"
            >
              <XIcon />
            </Button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex cursor-pointer flex-col items-center gap-2 py-4 text-center"
          >
            <UploadCloudIcon className="text-muted-foreground" aria-hidden="true" />
            <span className="text-sm font-medium">{prompt}</span>
            <span className="text-xs text-muted-foreground">
              Puede reemplazarlo antes de registrar la incidencia
            </span>
          </label>
        )}
        <Input
          ref={inputRef}
          id={id}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only !w-px"
          disabled={disabled}
          aria-invalid={fieldState.invalid}
          onBlur={field.onBlur}
          onChange={(event) => field.onChange(event.target.files?.[0] ?? null)}
        />
      </div>
      <FieldError>{fieldState.error?.message}</FieldError>
    </Field>
  )
}
