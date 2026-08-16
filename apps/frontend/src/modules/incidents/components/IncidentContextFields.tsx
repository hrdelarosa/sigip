import { SearchIcon } from 'lucide-react'
import { Controller } from 'react-hook-form'

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
import type { Incident } from '../types/incident.types'

export function IncidentContextFields({
  incident,
  disabled,
}: {
  incident?: Incident
  disabled?: boolean
}) {
  const context = useIncidentContextFields(incident)

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

      <FieldGroup className="grid min-w-0 gap-5 md:grid-cols-2">
        <Controller
          name="employeeId"
          control={context.control}
          render={({ field }) => (
            <Field
              data-invalid={Boolean(context.errors.employeeId)}
              className="min-w-0 gap-1.5 md:col-span-2"
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
                      : 'Busque por nombre o número de empleado'
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
          control={context.control}
          render={({ field }) => (
            <SelectField
              id="incident-assignment"
              label="Asignación laboral"
              value={field.value}
              items={context.assignmentItems}
              disabled={
                disabled ||
                Boolean(incident) ||
                !context.employeeId ||
                context.assignmentsQuery.isPending
              }
              placeholder={
                context.assignmentsQuery.isPending
                  ? 'Cargando asignaciones...'
                  : 'Seleccione'
              }
              error={context.errors.employeeAssignmentId?.message}
              inputRef={field.ref}
              onBlur={field.onBlur}
              onValueChange={context.selectAssignment}
            />
          )}
        />

        <Controller
          name="incidentTypeId"
          control={context.control}
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
                context.typesQuery.isPending ? 'Cargando tipos...' : 'Seleccione'
              }
              error={context.errors.incidentTypeId?.message}
              inputRef={field.ref}
              onBlur={field.onBlur}
              onValueChange={context.selectType}
            />
          )}
        />

      </FieldGroup>
    </div>
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
