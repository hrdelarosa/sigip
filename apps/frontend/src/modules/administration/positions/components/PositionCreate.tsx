import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createPositionFormSchema } from '../schemas/position-form.schema'

import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useCreatePosition } from '../hooks/useCreatePosition'

export default function PositionCreate() {
  const [open, setOpen] = useState(false)
  const createMutation = useCreatePosition()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createPositionFormSchema,
    defaultValues: { code: '', name: '', description: '' },
    onSubmit: (data) => {
      createMutation.mutate(
        { input: data },
        {
          onSuccess: (position) => {
            reset()
            setOpen(false)
            toast.success('Puesto creado', {
              description: `El puesto “${position.name}” se creó correctamente.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo crear el puesto', {
              description: error.message,
            })
          },
        },
      )
    },
  })
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      reset()
      createMutation.reset()
    }

    setOpen(nextOpen)
  }

  return (
    <FormDialog
      module="puesto"
      description="Complete los campos para crear un nuevo puesto."
      trigger={
        <Button>
          <Plus data-icon="inline-start" />
          Crear puesto
        </Button>
      }
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      error={createMutation.error}
    >
      <Field data-invalid={!!errors.code} className="gap-1.5">
        <FieldLabel htmlFor="position-code">Código</FieldLabel>
        <Input
          {...register('code')}
          id="position-code"
          autoFocus
          autoComplete="off"
          placeholder="AGENTE-MIGRACION-B"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? 'position-code-error' : undefined}
        />
        <FieldError id="position-code-error">{errors.code?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.name} className="gap-1.5">
        <FieldLabel htmlFor="position-name">Nombre</FieldLabel>
        <Input
          {...register('name')}
          id="position-name"
          autoComplete="off"
          placeholder="Agente Federal de Migración B"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'position-name-error' : undefined}
        />
        <FieldError id="position-name-error">{errors.name?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.description} className="gap-1.5">
        <FieldLabel htmlFor="position-description">Descripción</FieldLabel>
        <Textarea
          {...register('description')}
          id="position-description"
          className="h-22 resize-none"
          placeholder="Describe las responsabilidades de este puesto."
          disabled={createMutation.isPending}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? 'position-description-error' : undefined
          }
        />
        <FieldError id="position-description-error">
          {errors.description?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
