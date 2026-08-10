import { useValidatedForm } from '@/hooks/useValidatedForm'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import type { Employee } from '../types/employee.types'
import { updateEmployeeFormSchema } from '../schemas/employee-form.schema'
import { useUpdateEmployee } from '../hooks/useUpdateEmployee'
import { Controller } from 'react-hook-form'
import { EmployeeDatePickerField } from './EmployeeDatePickerField'

interface Props {
  employee: Employee
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function EmployeeEdit({ employee, open, onOpenChange }: Props) {
  const updateMutation = useUpdateEmployee()
  const defaults = {
    employeeNumber: employee.employeeNumber,
    fullName: employee.fullName,
    hireDate: employee.hireDate ?? '',
  }
  const { register, handleSubmit, errors, reset, control } = useValidatedForm({
    formSchema: updateEmployeeFormSchema,
    defaultValues: defaults,
    onSubmit: (input) => {
      updateMutation.mutate(
        { id: employee.id, input },
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
