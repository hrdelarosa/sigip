import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createPermissionFormSchema } from '../schemas/permission-form.schema'

import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useCreatePermission } from '../hooks/useCreatePermission'

export default function PermissionCreate() {
  const [open, setOpen] = useState(false)
  const createMutation = useCreatePermission()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createPermissionFormSchema,
    defaultValues: {
      code: '',
      description: '',
    },
    onSubmit: (data) => {
      createMutation.mutate(
        { input: data },
        {
          onSuccess: (createdPermission) => {
            reset()
            setOpen(false)
            toast.success('Permiso creado', {
              description: `El permiso “${createdPermission.code}” se creó correctamente.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo crear el permiso', {
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
      module="permiso"
      description="Complete los campos para crear un nuevo permiso."
      trigger={
        <Button>
          <Plus data-icon="inline-start" />
          Crear permiso
        </Button>
      }
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      error={createMutation.error}
    >
      <Field className="gap-1.5" data-invalid={!!errors.code}>
        <FieldLabel htmlFor="code">Código</FieldLabel>
        <Input
          {...register('code')}
          id="code"
          type="text"
          autoFocus
          autoComplete="off"
          placeholder="usuarios:crear"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.code}
          aria-describedby={errors.code ? 'code-error' : undefined}
        />
        <FieldError id="code-error">{errors.code?.message}</FieldError>
      </Field>

      <Field className="gap-1.5" data-invalid={!!errors.description}>
        <FieldLabel htmlFor="description">Descripción</FieldLabel>
        <Textarea
          {...register('description')}
          id="description"
          className="resize-none h-22"
          placeholder="Describe qué permite realizar este permiso."
          disabled={createMutation.isPending}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? 'description-error' : undefined
          }
        />
        <FieldError id="description-error">
          {errors.description?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
