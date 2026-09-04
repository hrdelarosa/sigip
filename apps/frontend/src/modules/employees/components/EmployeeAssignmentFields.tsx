import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from 'react-hook-form'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EmployeeAssignmentFormValues } from '../schemas/employee-assignment-form.schema'
import { EmployeeDatePickerField } from './EmployeeDatePickerField'

const appointmentItems = [
  { value: 'BASE', label: 'Base' },
  { value: 'CONFIANZA', label: 'Confianza' },
]

interface Props {
  idPrefix: string
  units: AssignmentOption[]
  positions: AssignmentOption[]
  isPending: boolean
  control: Control<EmployeeAssignmentFormValues>
  register: UseFormRegister<EmployeeAssignmentFormValues>
  errors: FieldErrors<EmployeeAssignmentFormValues>
}

export interface AssignmentOption {
  id: string
  code: string
  name: string
  isActive: boolean
}

export function EmployeeAssignmentFields({
  idPrefix,
  units,
  positions,
  isPending,
  control,
  register,
  errors,
}: Props) {
  const noOrganizationalUnitValue = '__none__'
  const unitItems = [
    {
      value: noOrganizationalUnitValue,
      label: 'Sin unidad asignada',
    },
    ...units.map((unit) => ({
      value: unit.id,
      label: `${unit.name}${!unit.isActive ? ' (inactiva)' : ''}`,
    })),
  ]
  const positionItems = positions.map((position) => ({
    value: position.id,
    label: `${position.name}${!position.isActive ? ' (inactivo)' : ''}`,
  }))

  return (
    <>
      <Controller
        name="organizationalUnitId"
        control={control}
        render={({ field }) => (
          <Field
            data-invalid={!!errors.organizationalUnitId}
            className="gap-1.5"
          >
            <FieldLabel htmlFor={`${idPrefix}-unit`}>
              Unidad organizativa
            </FieldLabel>
            <Select
              items={unitItems}
              value={field.value || noOrganizationalUnitValue}
              onValueChange={(value) =>
                field.onChange(value === noOrganizationalUnitValue ? '' : value)
              }
              disabled={isPending}
            >
              <SelectTrigger
                id={`${idPrefix}-unit`}
                className="w-full"
                aria-invalid={!!errors.organizationalUnitId}
                aria-describedby={
                  errors.organizationalUnitId
                    ? `${idPrefix}-unit-error`
                    : undefined
                }
              >
              <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={noOrganizationalUnitValue}>
                  Sin unidad asignada
                </SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.name}
                    {!unit.isActive ? ' (inactiva)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id={`${idPrefix}-unit-error`}>
              {errors.organizationalUnitId?.message}
            </FieldError>
          </Field>
        )}
      />

      <Controller
        name="positionId"
        control={control}
        render={({ field }) => (
          <Field data-invalid={!!errors.positionId} className="gap-1.5">
            <FieldLabel htmlFor={`${idPrefix}-position`}>Puesto</FieldLabel>
            <Select
              items={positionItems}
              value={field.value}
              onValueChange={field.onChange}
              disabled={isPending}
            >
              <SelectTrigger
                id={`${idPrefix}-position`}
                className="w-full"
                aria-invalid={!!errors.positionId}
                aria-describedby={
                  errors.positionId ? `${idPrefix}-position-error` : undefined
                }
              >
                <SelectValue placeholder="Selecciona un puesto" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.id} value={position.id}>
                    {position.name}
                    {!position.isActive ? ' (inactivo)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id={`${idPrefix}-position-error`}>
              {errors.positionId?.message}
            </FieldError>
          </Field>
        )}
      />

      <Controller
        name="appointmentType"
        control={control}
        render={({ field }) => (
          <Field data-invalid={!!errors.appointmentType} className="gap-1.5">
            <FieldLabel htmlFor={`${idPrefix}-appointment`}>
              Tipo de nombramiento
            </FieldLabel>
            <Select
              items={appointmentItems}
              value={field.value}
              onValueChange={field.onChange}
              disabled={isPending}
            >
              <SelectTrigger
                id={`${idPrefix}-appointment`}
                className="w-full"
                aria-invalid={!!errors.appointmentType}
                aria-describedby={
                  errors.appointmentType
                    ? `${idPrefix}-appointment-error`
                    : undefined
                }
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BASE">Base</SelectItem>
                <SelectItem value="CONFIANZA">Confianza</SelectItem>
              </SelectContent>
            </Select>
            <FieldError id={`${idPrefix}-appointment-error`}>
              {errors.appointmentType?.message}
            </FieldError>
          </Field>
        )}
      />

      <Field data-invalid={!!errors.schedule} className="gap-1.5">
        <FieldLabel htmlFor={`${idPrefix}-schedule`}>Horario</FieldLabel>
        <Input
          {...register('schedule')}
          id={`${idPrefix}-schedule`}
          placeholder="Lunes a viernes, 09:00–17:00"
          disabled={isPending}
          aria-invalid={!!errors.schedule}
          aria-describedby={
            errors.schedule ? `${idPrefix}-schedule-error` : undefined
          }
        />
        <FieldError id={`${idPrefix}-schedule-error`}>
          {errors.schedule?.message}
        </FieldError>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="effectiveFrom"
          control={control}
          render={({ field, fieldState }) => (
            <EmployeeDatePickerField
              id={`${idPrefix}-from`}
              label="Inicio"
              value={field.value}
              onChange={field.onChange}
              disabled={isPending}
              errorMessage={fieldState.error?.message}
            />
          )}
        />

        <Controller
          name="effectiveTo"
          control={control}
          render={({ field, fieldState }) => (
            <EmployeeDatePickerField
              id={`${idPrefix}-to`}
              label="Fin"
              value={field.value}
              onChange={field.onChange}
              disabled={isPending}
              errorMessage={fieldState.error?.message}
              placeholder="Sin fecha de fin"
            />
          )}
        />
      </div>

      <Field data-invalid={!!errors.notes} className="gap-1.5">
        <FieldLabel htmlFor={`${idPrefix}-notes`}>Notas</FieldLabel>
        <Textarea
          {...register('notes')}
          id={`${idPrefix}-notes`}
          className="h-20 resize-none"
          disabled={isPending}
          aria-invalid={!!errors.notes}
          aria-describedby={
            errors.notes ? `${idPrefix}-notes-error` : undefined
          }
        />
        <FieldError id={`${idPrefix}-notes-error`}>
          {errors.notes?.message}
        </FieldError>
      </Field>
    </>
  )
}
