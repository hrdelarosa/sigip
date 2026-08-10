import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createOrganizationalUnitFormSchema } from '../schemas/organizational-units.schema'

import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useCreateOrganizationalUnits } from '../hooks/useCreateOrganizationalUnits'

export default function OrganizationalUnitCreate() {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateOrganizationalUnits()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: createOrganizationalUnitFormSchema,
    defaultValues: {
      parentId: null,
      code: '',
      name: '',
      description: '',
    },
    onSubmit: (data) => {
      createMutation.mutate(
        { input: data },
        {
          onSuccess: (organizationalUnit) => {
            reset()
            setOpen(false)
            toast.success('Unidad organizacional creada', {
              description: `La unidad organizacional “${organizationalUnit.name}” se creó correctamente.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo crear la unidad organizacional', {
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
      module="unidad organizacional"
      description="Complete los campos para crear una nueva unidad organizacional."
      trigger={
        <Button>
          <Plus data-icon="inline-start" />
          Crear unidad organizacional
        </Button>
      }
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      error={createMutation.error}
    >
      {/* <Field data-invalid={!!errors.code}>
        <FieldLabel htmlFor="organizational-unit-code">Código</FieldLabel>
        <Input
          {...register('parentId')}
          id="organizational-unit-parentId"
          autoFocus
          autoComplete="off"
          placeholder="ID de la unidad organizacional padre"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.parentId}
          aria-describedby={
            errors.parentId ? 'organizational-unit-parentId-error' : undefined
          }
        />
        <FieldError id="organizational-unit-parentId-error">
          {errors.parentId?.message}
        </FieldError>
      </Field> */}

      <Field data-invalid={!!errors.code} className="gap-1.5">
        <FieldLabel htmlFor="organizational-unit-code">Código</FieldLabel>
        <Input
          {...register('code')}
          id="organizational-unit-code"
          autoFocus
          autoComplete="off"
          placeholder="ASUNTOS-ADMINISTRATIVOS"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.code}
          aria-describedby={
            errors.code ? 'organizational-unit-code-error' : undefined
          }
        />
        <FieldError id="organizational-unit-code-error">
          {errors.code?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.name} className="gap-1.5">
        <FieldLabel htmlFor="organizational-unit-name">Nombre</FieldLabel>
        <Input
          {...register('name')}
          id="organizational-unit-name"
          autoComplete="off"
          placeholder="Asuntos Administrativos"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.name}
          aria-describedby={
            errors.name ? 'organizational-unit-name-error' : undefined
          }
        />
        <FieldError id="organizational-unit-name-error">
          {errors.name?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.description} className="gap-1.5">
        <FieldLabel htmlFor="organizational-unit-description">
          Descripción
        </FieldLabel>
        <Textarea
          {...register('description')}
          id="organizational-unit-description"
          className="h-22 resize-none"
          placeholder="Describe las responsabilidades de esta unidad organizacional."
          disabled={createMutation.isPending}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description
              ? 'organizational-unit-description-error'
              : undefined
          }
        />
        <FieldError id="organizational-unit-description-error">
          {errors.description?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
