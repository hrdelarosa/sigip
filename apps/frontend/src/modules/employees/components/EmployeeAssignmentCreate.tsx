import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/form-dialog'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useOrganizationalUnits } from '@/modules/administration/organizational-units/hooks/useOrganizationalUnits'
import { usePositions } from '@/modules/administration/positions/hooks/usePositions'
import { employeeAssignmentFormSchema } from '../schemas/employee-assignment-form.schema'
import { useCreateEmployeeAssignment } from '../hooks/useCreateEmployeeAssignment'
import { EmployeeAssignmentFields } from './EmployeeAssignmentFields'

export default function EmployeeAssignmentCreate({ employeeId }: { employeeId: string }) {
  const [open, setOpen] = useState(false)
  const unitsQuery = useOrganizationalUnits()
  const positionsQuery = usePositions()
  const createMutation = useCreateEmployeeAssignment()
  const defaults = {
    organizationalUnitId: '',
    positionId: '',
    appointmentType: 'BASE' as const,
    schedule: '',
    effectiveFrom: '',
    effectiveTo: '',
    notes: '',
  }
  const { register, control, errors, handleSubmit, reset } = useValidatedForm({
    formSchema: employeeAssignmentFormSchema,
    defaultValues: defaults,
    onSubmit: (input) => {
      createMutation.mutate(
        { employeeId, input },
        {
          onSuccess: () => {
            reset(defaults)
            setOpen(false)
            toast.success('Asignación creada')
          },
          onError: (error) =>
            toast.error('No se pudo crear la asignación', {
              description: error.message,
            }),
        },
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (createMutation.isPending) return
    if (!nextOpen) {
      reset(defaults)
      createMutation.reset()
    }
    setOpen(nextOpen)
  }

  const isLoadingOptions = unitsQuery.isPending || positionsQuery.isPending
  const optionsError = unitsQuery.error ?? positionsQuery.error
  const optionsUnavailable = Boolean(
    (unitsQuery.error && !unitsQuery.data) ||
      (positionsQuery.error && !positionsQuery.data),
  )

  return (
    <FormDialog
      module="asignación"
      description="Registra la unidad, el puesto y la vigencia de la asignación."
      trigger={
        <Button size="sm">
          <Plus />
          Nueva asignación
        </Button>
      }
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={
        createMutation.isPending || isLoadingOptions || optionsUnavailable
      }
      error={createMutation.error ?? optionsError}
    >
      {optionsError ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            void Promise.all([unitsQuery.refetch(), positionsQuery.refetch()])
          }}
        >
          Reintentar carga de catálogos
        </Button>
      ) : null}
      <EmployeeAssignmentFields
        idPrefix={`assignment-create-${employeeId}`}
        units={(unitsQuery.data ?? []).filter((unit) => unit.isActive)}
        positions={(positionsQuery.data ?? []).filter((position) => position.isActive)}
        isPending={
          createMutation.isPending || isLoadingOptions || optionsUnavailable
        }
        control={control}
        register={register}
        errors={errors}
      />
    </FormDialog>
  )
}
