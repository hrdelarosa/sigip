import { toast } from 'sonner'
import { FormDialog } from '@/components/form-dialog'
import { Button } from '@/components/ui/button'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useOrganizationalUnits } from '@/modules/administration/organizational-units/hooks/useOrganizationalUnits'
import { usePositions } from '@/modules/administration/positions/hooks/usePositions'
import type { EmployeeAssignment } from '../types/employee.types'
import { employeeAssignmentFormSchema } from '../schemas/employee-assignment-form.schema'
import { useUpdateEmployeeAssignment } from '../hooks/useUpdateEmployeeAssignment'
import { EmployeeAssignmentFields } from './EmployeeAssignmentFields'
import type { AssignmentOption } from './EmployeeAssignmentFields'

interface Props {
  assignment: EmployeeAssignment
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmployeeAssignmentEdit({ assignment, open, onOpenChange }: Props) {
  const unitsQuery = useOrganizationalUnits()
  const positionsQuery = usePositions()
  const updateMutation = useUpdateEmployeeAssignment()
  const defaults = {
    organizationalUnitId: assignment.organizationalUnitId ?? '',
    positionId: assignment.positionId,
    appointmentType: assignment.appointmentType,
    schedule: assignment.schedule ?? '',
    effectiveFrom: assignment.effectiveFrom,
    effectiveTo: assignment.effectiveTo ?? '',
    notes: assignment.notes ?? '',
  }
  const { register, control, errors, handleSubmit, reset } = useValidatedForm({
    formSchema: employeeAssignmentFormSchema,
    defaultValues: defaults,
    onSubmit: (input) => {
      updateMutation.mutate(
        {
          employeeId: assignment.employeeId,
          assignmentId: assignment.id,
          previousPositionId: assignment.positionId,
          input,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            toast.success('Asignación actualizada')
          },
          onError: (error) =>
            toast.error('No se pudo actualizar la asignación', {
              description: error.message,
            }),
        },
      )
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    if (updateMutation.isPending) return
    reset(defaults)
    updateMutation.reset()
    onOpenChange(nextOpen)
  }

  const units: AssignmentOption[] = (unitsQuery.data ?? [])
    .filter((unit) => unit.isActive || unit.id === assignment.organizationalUnitId)
    .map(({ id, code, name, isActive }) => ({ id, code, name, isActive }))
  if (
    assignment.organizationalUnit &&
    !units.some((unit) => unit.id === assignment.organizationalUnitId)
  ) {
    units.push({ ...assignment.organizationalUnit, isActive: false })
  }
  const positions: AssignmentOption[] = (positionsQuery.data ?? [])
    .filter((position) => position.isActive || position.id === assignment.positionId)
    .map(({ id, code, name, isActive }) => ({ id, code, name, isActive }))
  if (!positions.some((position) => position.id === assignment.positionId)) {
    positions.push({ ...assignment.position, isActive: false })
  }
  const isLoadingOptions = unitsQuery.isPending || positionsQuery.isPending
  const optionsError = unitsQuery.error ?? positionsQuery.error
  const optionsUnavailable = Boolean(
    (unitsQuery.error && !unitsQuery.data) ||
      (positionsQuery.error && !positionsQuery.data),
  )

  return (
    <FormDialog
      mode="edit"
      module="asignación"
      description="Actualice el puesto, la unidad opcional o la vigencia de la asignación."
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={
        updateMutation.isPending || isLoadingOptions || optionsUnavailable
      }
      error={updateMutation.error ?? optionsError}
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
        idPrefix={`assignment-edit-${assignment.id}`}
        units={units}
        positions={positions}
        isPending={
          updateMutation.isPending || isLoadingOptions || optionsUnavailable
        }
        control={control}
        register={register}
        errors={errors}
      />
    </FormDialog>
  )
}
