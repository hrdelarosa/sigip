import { useValidatedForm } from '@/hooks/useValidatedForm'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { Employee, UpdateEmployeeInput } from '../types/employee.types'
import { updateEmployeeFormSchema } from '../schemas/employee-form.schema'
import { useUpdateEmployee } from '../hooks/useUpdateEmployee'
import { Controller } from 'react-hook-form'
import { EmployeeDatePickerField } from './EmployeeDatePickerField'
import { Controller as RHFController } from 'react-hook-form'
import { useEmployeeOfficeOptions } from '../hooks/useEmployeeOfficeOptions'
import { UserOfficeField } from '@/modules/administration/users/components/UserOfficeField'
import { useAuth, hasPermission } from '@/modules/auth/hooks/useAuth'

interface Props {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmployeeEdit({ employee, open, onOpenChange }: Props) {
  const updateMutation = useUpdateEmployee()
  const officesQuery = useEmployeeOfficeOptions()
  const auth = useAuth()
  const canChooseOffice = hasPermission(auth.data?.permissions, 'offices:access-all')
  const defaults = {
    employeeNumber: employee.employeeNumber,
    officeId: employee.officeId,
    fullName: employee.fullName,
    hireDate: employee.hireDate ?? '',
  }
  const { register, handleSubmit, errors, reset, control } = useValidatedForm({
      formSchema: updateEmployeeFormSchema,
      defaultValues: defaults,
      onSubmit: (input) => {
        const updateInput: UpdateEmployeeInput = { ...input }
        if (updateInput.officeId === employee.officeId) delete updateInput.officeId
        updateMutation.mutate(
          { id: employee.id, input: updateInput },
        {
          onSuccess: (updatedEmployee) => {
            onOpenChange(false)
            toast.success('Empleado actualizado', {
              description: `Los cambios de “${updatedEmployee.fullName}” se guardaron.`,
            })
          },
          onError: (error) =>
            toast.error('No se pudo actualizar el empleado', {
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

  return (
    <FormDialog
      mode="edit"
      module="empleado"
      description="Actualice los datos generales del empleado."
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={updateMutation.isPending}
      error={updateMutation.error}
    >
      <Field data-invalid={!!errors.employeeNumber} className="gap-1.5">
        <FieldLabel htmlFor={`employee-number-${employee.id}`}>
          Número de empleado
        </FieldLabel>
        <Input
          {...register('employeeNumber')}
          id={`employee-number-${employee.id}`}
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.employeeNumber}
          aria-describedby={
            errors.employeeNumber
              ? `employee-number-${employee.id}-error`
              : undefined
          }
        />
        <FieldError id={`employee-number-${employee.id}-error`}>
          {errors.employeeNumber?.message}
        </FieldError>
      </Field>

      <RHFController name="officeId" control={control} render={({ field, fieldState }) => <>{/* Mantener visible la oficina actual aunque esté inactiva y no venga en el lookup. */}<UserOfficeField id={`employee-office-${employee.id}`} offices={[...(officesQuery.data ?? []).filter((office) => office.id !== employee.officeId), ...(officesQuery.data ?? []).filter((office) => office.id === employee.officeId), ...(employee.officeId && !(officesQuery.data ?? []).some((office) => office.id === employee.officeId) ? [{ id: employee.officeId, code: '', name: 'Oficina actual' }] : [])]} value={field.value} onChange={field.onChange} error={fieldState.error?.message} disabled={!canChooseOffice || updateMutation.isPending || officesQuery.isPending || officesQuery.isError} nameOnly />{officesQuery.isError ? <div role="alert">No se pudieron cargar las oficinas. <Button type="button" variant="link" onClick={() => officesQuery.refetch()}>Reintentar</Button></div> : null}{canChooseOffice && field.value !== employee.officeId ? <p role="note">Cambiar la oficina reclasifica el historial y las asignaciones del empleado.</p> : null}</>} />

      <Field data-invalid={!!errors.fullName} className="gap-1.5">
        <FieldLabel htmlFor={`employee-name-${employee.id}`}>
          Nombre completo
        </FieldLabel>
        <Input
          {...register('fullName')}
          id={`employee-name-${employee.id}`}
          disabled={updateMutation.isPending}
          aria-invalid={!!errors.fullName}
          aria-describedby={
            errors.fullName ? `employee-name-${employee.id}-error` : undefined
          }
        />
        <FieldError id={`employee-name-${employee.id}-error`}>
          {errors.fullName?.message}
        </FieldError>
      </Field>

      <Controller
        name="hireDate"
        control={control}
        render={({ field, fieldState }) => (
          <EmployeeDatePickerField
            id={`employee-hire-date-${employee.id}`}
            label="Fecha de contratación"
            value={field.value}
            onChange={field.onChange}
            disabled={updateMutation.isPending}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </FormDialog>
  )
}
