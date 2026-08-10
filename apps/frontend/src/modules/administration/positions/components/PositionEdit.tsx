import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useUpdatePosition } from '../hooks/useUpdatePosition'
import type { Position } from '../types/positions.types'
import { updatePositionFormSchema } from '../schemas/position-form.schema'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  position: Position
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PositionEdit({ position, open, onOpenChange }: Props) {
  const updateMutation = useUpdatePosition()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: updatePositionFormSchema,
    defaultValues: {
      name: position.name,
      description: position.description ?? '',
    },
    onSubmit: (data) => {
      updateMutation.mutate(
        { id: position.id, input: data },
        {
          onSuccess: (updatedPosition) => {
            onOpenChange(false)
            toast.success('Puesto actualizado', {
              description: `Los cambios de “${updatedPosition.name}” se guardaron.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo actualizar el puesto', {
              description: error.message,
            })
          },
        },
      )
    },
  })

  function handleOpenChange(nexOpen: boolean) {
    if (updateMutation.isPending) return
    reset({ name: position.name, description: position.description ?? '' })
    updateMutation.reset()
    onOpenChange(nexOpen)
  }

  return (
    <FormDialog
      mode="edit"
      module="puesto"
      description="Actualice el nombre y la descripción del puesto."
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={updateMutation.isPending}
      error={updateMutation.error}
    >
      <Field data-disabled>
        <FieldLabel htmlFor={`position-code-${position.id}`}>Código</FieldLabel>
        <Input
          id={`position-code-${position.id}`}
          value={position.code}
          disabled
        />
      </Field>

      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor={`position-name-${position.id}`}>Nombre</FieldLabel>
        <Input
          {...register('name')}
          id={`position-name-${position.id}`}
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.name}
          aria-describedby={
            errors.name ? `position-name-${position.id}-error` : undefined
          }
        />
        <FieldError id={`position-name-${position.id}-error`}>
          {errors.name?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor={`position-description-${position.id}`}>
          Descripción
        </FieldLabel>
        <Textarea
          {...register('description')}
          id={`position-description-${position.id}`}
          className="resize-none h-22"
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description
              ? `position-description-${position.id}-error`
              : undefined
          }
        />
        <FieldError id={`position-description-${position.id}-error`}>
          {errors.description?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
