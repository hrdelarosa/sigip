import { SearchIcon } from 'lucide-react'
import { type Control, Controller, type UseFormSetValue } from 'react-hook-form'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { InputGroupAddon } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useIncidentContextFields,
  type EmployeeOption,
} from '../hooks/useIncidentContextFields'
import type { IncidentFormValues } from '../schemas/incident-form.schema'
import type { Incident } from '../types/incident.types'

export type IncidentContextFieldsState = ReturnType<
  typeof useIncidentContextFields
>

export function IncidentEmployeeFields({
  control,
  incident,
  disabled,
  context,
}: {
  control: Control<IncidentFormValues>
  incident?: Incident
  disabled?: boolean
  context: IncidentContextFieldsState
}) {
  return (
    <div className="flex flex-col gap-4">
      {context.hasCatalogError ? (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar los datos de selección</AlertTitle>
          <AlertDescription>
            Revise sus permisos o conexión y vuelva a intentar la carga.
          </AlertDescription>
        </Alert>
      ) : null}

      <FieldGroup className="grid gap-5 sm:grid-cols-2">
        <Controller
          name="employeeId"
          control={control}
          render={({ field }) => (
            <Field
              data-invalid={Boolean(context.errors.employeeId)}
              className="min-w-0 gap-1.5"
            >
              <FieldLabel htmlFor="incident-employee">Empleado</FieldLabel>
              <Combobox
                items={context.employeeOptions}
                value={context.selectedEmployee}
                filter={null}
                itemToStringLabel={(employee: EmployeeOption) =>
                  `${employee.fullName} · ${employee.employeeNumber}`
                }
                itemToStringValue={(employee: EmployeeOption) => employee.id}
                onInputValueChange={context.setEmployeeSearch}
                onValueChange={context.selectEmployee}
              >
                <ComboboxInput
                  id="incident-employee"
                  ref={field.ref}
                  className="w-full min-w-0"
                  placeholder={
                    context.employeesQuery.isPending
                      ? 'Cargando empleados...'
                      : 'Seleccione un empleado'
                  }
                  disabled={disabled || Boolean(incident)}
                  aria-invalid={Boolean(context.errors.employeeId)}
                  aria-describedby={
                    context.errors.employeeId
                      ? 'incident-employee-error'
                      : undefined
                  }
                  onBlur={field.onBlur}
                >
                  <InputGroupAddon>
                    <SearchIcon aria-hidden="true" />
                  </InputGroupAddon>
                </ComboboxInput>
                <ComboboxContent>
                  <ComboboxEmpty>
                    {context.employeesQuery.isPending
                      ? 'Buscando empleados...'
                      : 'No se encontraron empleados activos.'}
                  </ComboboxEmpty>
                  <ComboboxList>
                    {(employee: EmployeeOption) => (
                      <ComboboxItem key={employee.id} value={employee}>
                        <div className="min-w-0 pr-4">
                          <p className="truncate font-medium">
                            {employee.fullName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            Número {employee.employeeNumber}
                          </p>
                        </div>
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <FieldDescription>
                Escriba para buscar únicamente entre empleados activos.
              </FieldDescription>
              <FieldError id="incident-employee-error">
                {context.errors.employeeId?.message}
              </FieldError>
            </Field>
          )}
        />

        <Controller
          name="employeeAssignmentId"
          control={control}
          render={({ field }) => (
            <SelectField
              id="incident-assignment"
              label="Asignación"
              value={field.value}
              items={context.assignmentItems}
              disabled={
                disabled ||
                Boolean(incident) ||
                !context.employeeId ||
                context.assignmentsQuery.isPending
              }
              placeholder={
                !context.employeeId
                  ? 'Seleccione primero un empleado'
                  : context.assignmentsQuery.isPending
                    ? 'Cargando asignaciones...'
                    : 'Seleccione una asignación'
              }
              error={context.errors.employeeAssignmentId?.message}
              inputRef={field.ref}
              onBlur={field.onBlur}
              onValueChange={context.selectAssignment}
            />
          )}
        />
      </FieldGroup>
    </div>
  )
}

export function IncidentTypeField({
  control,
  disabled,
  context,
}: {
  control: Control<IncidentFormValues>
  disabled?: boolean
  context: IncidentContextFieldsState
}) {
  return (
    <Controller
      name="incidentTypeId"
      control={control}
      render={({ field }) => (
        <SelectField
          id="incident-type"
          label="Tipo de incidencia"
          value={field.value}
          items={context.typeItems}
          disabled={
            disabled ||
            !context.assignmentId ||
            !context.selectedAssignment ||
            context.assignmentsQuery.isPending ||
            context.assignmentsQuery.isError ||
            context.typesQuery.isPending ||
            context.typesQuery.isError
          }
          placeholder={
            !context.assignmentId
              ? 'Seleccione primero una asignación'
              : context.typesQuery.isPending
                ? 'Cargando tipos...'
                : 'Seleccione un tipo'
          }
          error={context.errors.incidentTypeId?.message}
          inputRef={field.ref}
          onBlur={field.onBlur}
          onValueChange={context.selectType}
        />
      )}
    />
  )
}

/** @deprecated Use IncidentEmployeeFields with shared context */
export function IncidentContextFields({
  control,
  setValue,
  incident,
  disabled,
}: {
  control: Control<IncidentFormValues>
  setValue: UseFormSetValue<IncidentFormValues>
  incident?: Incident
  disabled?: boolean
}) {
  const context = useIncidentContextFields(control, setValue, incident)

  return (
    <>
      <IncidentEmployeeFields
        control={control}
        incident={incident}
        disabled={disabled}
        context={context}
      />
      <IncidentTypeField
        control={control}
        disabled={disabled}
        context={context}
      />
    </>
  )
}

function SelectField({
  id,
  label,
  value,
  items,
  disabled,
  placeholder,
  error,
  inputRef,
  onBlur,
  onValueChange,
}: {
  id: string
  label: string
  value: string
  items: { value: string; label: string }[]
  disabled?: boolean
  placeholder: string
  error?: string
  inputRef?: React.Ref<HTMLButtonElement>
  onBlur?: () => void
  onValueChange: (value: string | null) => void
}) {
  return (
    <Field data-invalid={Boolean(error)} className="min-w-0 gap-1.5">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          ref={inputRef}
          id={id}
          className="w-full"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onBlur={onBlur}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label}</SelectLabel>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </Field>
  )
}
