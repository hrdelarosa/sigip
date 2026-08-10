import { useState } from 'react'
import { Plus } from 'lucide-react'
import { createEmployeeFormSchema } from '../schemas/employee-form.schema'

import { Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/form-dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { useValidatedForm } from '@/hooks/useValidatedForm'
import { useCreateEmployee } from '../hooks/useCreateEmployee'
import { EmployeeDatePickerField } from './EmployeeDatePickerField'

export default function EmployeeCreate() {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateEmployee()
  const { register, handleSubmit, errors, reset, control } = useValidatedForm({
    formSchema: createEmployeeFormSchema,
    defaultValues: {
      employeeNumber: '',
      fullName: '',
      hireDate: '',
    },
    onSubmit: (data) => {
      createMutation.mutate(
        { input: data },
        {
          onSuccess: (employee) => {
            reset()
            setOpen(false)
            toast.success('Empleado creado', {
              description: `El empleado “${employee.fullName}” se creó correctamente.`,
            })
          },
          onError: (error) => {
            toast.error('No se pudo crear el empleado', {
              description: error.message,
            })
          },
        },
      )
    },
  })
  const handleOpenChange = (nextOpen: boolean) => {
    if (createMutation.isPending) return
    if (!nextOpen) {
      reset()
      createMutation.reset()
    }

    setOpen(nextOpen)
  }

  return (
    <FormDialog
      module="empleado"
      description="Complete los campos para crear un nuevo empleado."
      trigger={
        <Button>
          <Plus data-icon="inline-start" />
          Crear empleado
        </Button>
      }
      open={open}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      isPending={createMutation.isPending}
      error={createMutation.error}
    >
      <Field data-invalid={!!errors.employeeNumber} className="gap-1.5">
        <FieldLabel htmlFor="employee-number">Número de empleado</FieldLabel>
        <Input
          {...register('employeeNumber')}
          id="employee-number"
          autoFocus
          autoComplete="off"
          placeholder="EMP-0019"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.employeeNumber}
          aria-describedby={
            errors.employeeNumber ? 'employee-number-error' : undefined
          }
        />
        <FieldError id="employee-number-error">
          {errors.employeeNumber?.message}
        </FieldError>
      </Field>

      <Field data-invalid={!!errors.fullName} className="gap-1.5">
        <FieldLabel htmlFor="employee-full-name">Nombre completo</FieldLabel>
        <Input
          {...register('fullName')}
          id="employee-full-name"
          autoComplete="off"
          placeholder="Juan Pérez García"
          disabled={createMutation.isPending}
          aria-invalid={!!errors.fullName}
          aria-describedby={
            errors.fullName ? 'employee-full-name-error' : undefined
          }
        />
        <FieldError id="employee-full-name-error">
          {errors.fullName?.message}
        </FieldError>
      </Field>

      <Controller
        name="hireDate"
        control={control}
        render={({ field, fieldState }) => (
          <EmployeeDatePickerField
            id="employee-hire-date"
            label="Fecha de contratación"
            value={field.value}
            onChange={field.onChange}
            disabled={createMutation.isPending}
            errorMessage={fieldState.error?.message}
          />
        )}
      />
    </FormDialog>
  )
}
