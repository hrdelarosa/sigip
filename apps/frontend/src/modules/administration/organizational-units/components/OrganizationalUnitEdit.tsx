import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useUpdateOrganizationalUnit } from '../hooks/useUpdateOrganizationalUnit'
import type { OrganizationalUnit } from '../types/organizational-units.types'
import { updateOrganizationalUnitFormSchema } from '../schemas/organizational-units.schema'
import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  organizationalUnit: OrganizationalUnit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OrganizationalUnitEdit({
  organizationalUnit,
  open,
  onOpenChange,
}: Props) {
  const updateMutation = useUpdateOrganizationalUnit()
  const { register, handleSubmit, errors, reset } = useValidatedForm({
    formSchema: updateOrganizationalUnitFormSchema,
    defaultValues: {
      parentId: organizationalUnit.parentId,
      name: organizationalUnit.name,
      description: organizationalUnit.description ?? '',
      sortOrder: organizationalUnit.sortOrder,
    },
    onSubmit: (data) => {
      updateMutation.mutate(
        { id: organizationalUnit.id, input: data },
        {
          onSuccess: (updatedOrganizationalUnit) => {
            onOpenChange(false)
            toast.success('Unidad organizacional actualizada', {
              description: `Los cambios de “${updatedOrganizationalUnit.name}” se guardaron.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo actualizar la unidad organizacional', {
              description: error.message,
            })
          },
        },
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (updateMutation.isPending) return
    reset({
      parentId: organizationalUnit.parentId,
      name: organizationalUnit.name,
      description: organizationalUnit.description ?? '',
      sortOrder: organizationalUnit.sortOrder,
    })
    updateMutation.reset()
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      mode="edit"
      module="unidad organizacional"
      description="Actualice el nombre, la descripción y el orden de clasificación de la unidad organizacional."
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={updateMutation.isPending}
      error={updateMutation.error}
    >
      <Field data-disabled>
        <FieldLabel
          htmlFor={`organizational-unit-code-${organizationalUnit.id}`}
        >
          Código
        </FieldLabel>
        <Input
          id={`organizational-unit-code-${organizationalUnit.id}`}
          value={organizationalUnit.code}
          disabled
        />
      </Field>

      <Field data-invalid={!!errors.name}>
        <FieldLabel
          htmlFor={`organizational-unit-name-${organizationalUnit.id}`}
        >
          Nombre
        </FieldLabel>
        <Input
          {...register('name')}
          id={`organizational-unit-name-${organizationalUnit.id}`}
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.name}
          aria-describedby={
            errors.name
              ? `organizational-unit-name-${organizationalUnit.id}-error`
              : undefined
          }
        />
        <FieldError
          id={`organizational-unit-name-${organizationalUnit.id}-error`}
        >
          {errors.name?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.description}>
        <FieldLabel
          htmlFor={`organizational-unit-description-${organizationalUnit.id}`}
        >
          Descripción
        </FieldLabel>
        <Textarea
          {...register('description')}
          id={`organizational-unit-description-${organizationalUnit.id}`}
          className="resize-none h-22"
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description
              ? `organizational-unit-description-${organizationalUnit.id}-error`
              : undefined
          }
        />
        <FieldError
          id={`organizational-unit-description-${organizationalUnit.id}-error`}
        >
          {errors.description?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.sortOrder}>
        <FieldLabel
          htmlFor={`organizational-unit-sort-order-${organizationalUnit.id}`}
        >
          Orden de clasificación
        </FieldLabel>
        <Input
          {...register('sortOrder', { valueAsNumber: true })}
          type="number"
          id={`organizational-unit-sort-order-${organizationalUnit.id}`}
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.sortOrder}
          aria-describedby={
            errors.sortOrder
              ? `organizational-unit-sort-order-${organizationalUnit.id}-error`
              : undefined
          }
        />
        <FieldError
          id={`organizational-unit-sort-order-${organizationalUnit.id}-error`}
        >
          {errors.sortOrder?.message}
        </FieldError>
      </Field>
    </FormDialog>
  )
}
