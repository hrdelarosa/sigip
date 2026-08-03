import { updatePermissionFormSchema } from '../schemas/permission-form.schema'
import type { Permission } from '../types/permission.types'

import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useUpdatePermission } from '../hooks/useUpdatePermission'
import { useValidatedForm } from '@/hooks/useValidatedForm'

interface Props {
  permission: Permission
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function PermissionEdit({
  permission,
  open,
  onOpenChange,
}: Props) {
  const updateMutation = useUpdatePermission()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: updatePermissionFormSchema,
    defaultValues: {
      description: permission.description ?? '',
    },
    onSubmit: (data) => {
      updateMutation.mutate(
        { id: permission.id, input: data },
        {
          onSuccess: (updatedPermission) => {
            onOpenChange(false)
            toast.success('Permiso actualizado correctamente', {
              description: `Los cambios de “${updatedPermission.code}” se guardaron.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo actualizar el permiso', {
              description: error.message,
            })
          },
        },
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    reset({ description: permission.description ?? '' })
    updateMutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      mode="edit"
      module="permiso"
      description="Actualice la descripción del permiso seleccionado."
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={updateMutation.isPending}
      error={updateMutation.error}
    >
      <Field data-disabled>
        <FieldLabel htmlFor={`code-${permission.id}`}>Código</FieldLabel>
        <Input id={`code-${permission.id}`} value={permission.code} disabled />
      </Field>

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor={`description-${permission.id}`}>
          Descripción
        </FieldLabel>
        <Textarea
          {...register('description')}
          id={`description-${permission.id}`}
          placeholder="Describe qué permite realizar este permiso."
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description
              ? `description-${permission.id}-error`
              : undefined
          }
        />
        <FieldError id={`description-${permission.id}-error`}>
          {errors.description?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
