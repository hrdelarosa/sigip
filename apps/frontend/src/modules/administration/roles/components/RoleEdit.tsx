import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useUpdateRole } from '../hooks/useUpdateRole'
import { updateRoleFormSchema } from '../schemas/role-form.schema'
import type { Role } from '../types/roles.types'

interface Props {
  role: Role
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function RoleEdit({ role, open, onOpenChange }: Props) {
  const updateMutation = useUpdateRole()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: updateRoleFormSchema,
    defaultValues: {
      name: role.name,
      description: role.description ?? '',
    },
    onSubmit: (data) => {
      updateMutation.mutate(
        { id: role.id, input: data },
        {
          onSuccess: (updatedRole) => {
            onOpenChange(false)
            toast.success('Rol actualizado', {
              description: `Los cambios de “${updatedRole.name}” se guardaron.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo actualizar el rol', {
              description: error.message,
            })
          },
        },
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    reset({ name: role.name, description: role.description ?? '' })
    updateMutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      mode="edit"
      module="rol"
      description="Actualice el nombre y la descripción del rol."
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={updateMutation.isPending}
      error={updateMutation.error}
    >
      <Field data-disabled>
        <FieldLabel htmlFor={`role-code-${role.id}`}>Código</FieldLabel>
        <Input id={`role-code-${role.id}`} value={role.code} disabled />
      </Field>

      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor={`role-name-${role.id}`}>Nombre</FieldLabel>
        <Input
          {...register('name')}
          id={`role-name-${role.id}`}
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.name}
          aria-describedby={
            errors.name ? `role-name-${role.id}-error` : undefined
          }
        />
        <FieldError id={`role-name-${role.id}-error`}>
          {errors.name?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor={`role-description-${role.id}`}>
          Descripción
        </FieldLabel>
        <Textarea
          {...register('description')}
          id={`role-description-${role.id}`}
          className="resize-none h-22"
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? `role-description-${role.id}-error` : undefined
          }
        />
        <FieldError id={`role-description-${role.id}-error`}>
          {errors.description?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
