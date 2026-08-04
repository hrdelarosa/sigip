import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createRoleFormSchema } from '../schemas/role-form.schema'

import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useCreateRole } from '../hooks/useCreateRole'

export default function RoleCreate() {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateRole()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createRoleFormSchema,
    defaultValues: { code: '', name: '', description: '' },
    onSubmit: (data) => {
      createMutation.mutate(
        { input: data },
        {
          onSuccess: (role) => {
            reset()
            setOpen(false)
            toast.success('Rol creado', {
              description: `El rol “${role.name}” se creó correctamente.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo crear el rol', {
              description: error.message,
            })
          },
        },
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset()
      createMutation.reset()
    }
    setOpen(nextOpen)
  }

  return (
    <FormDialog
      module="rol"
      description="Complete los campos para crear un nuevo rol."
      trigger={
        <Button>
          <Plus data-icon="inline-start" />
          Crear rol
        </Button>
      }
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      error={createMutation.error}
    >
      <Field data-invalid={!!errors.code}>
        <FieldLabel htmlFor="role-code">Código</FieldLabel>
        <Input
          {...register('code')}
          id="role-code"
          autoFocus
          autoComplete="off"
          placeholder="SUPERVISOR"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? 'role-code-error' : undefined}
        />
        <FieldError id="role-code-error">{errors.code?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="role-name">Nombre</FieldLabel>
        <Input
          {...register('name')}
          id="role-name"
          autoComplete="off"
          placeholder="Supervisor"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'role-name-error' : undefined}
        />
        <FieldError id="role-name-error">{errors.name?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor="role-description">Descripción</FieldLabel>
        <Textarea
          {...register('description')}
          id="role-description"
          className="h-22 resize-none"
          placeholder="Describe las responsabilidades de este rol."
          disabled={createMutation.isPending}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? 'role-description-error' : undefined
          }
        />
        <FieldError id="role-description-error">
          {errors.description?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
