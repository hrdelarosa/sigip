import { useQuery } from '@tanstack/react-query'
import { useDeferredValue, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { useEmployeeAssignments } from '@/modules/employees/hooks/useEmployeeAssignments'
import { useEmployees } from '@/modules/employees/hooks/useEmployees'
import { incidentTypesQueryOptions } from '../queries/incident-query-options'
import type { IncidentFormValues } from '../schemas/incident-form.schema'
import type { Incident } from '../types/incident.types'

export interface EmployeeOption {
  id: string
  fullName: string
  employeeNumber: string
}

export function useIncidentContextFields(incident?: Incident) {
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(
    () =>
      incident
        ? {
            id: incident.employee.id,
            fullName: incident.employee.fullName,
            employeeNumber: incident.employee.employeeNumber,
          }
        : null,
  )
  const deferredSearch = useDeferredValue(employeeSearch)
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<IncidentFormValues>()
  const employeeId = useWatch({ control, name: 'employeeId' })
  const assignmentId = useWatch({ control, name: 'employeeAssignmentId' })
  const employeesQuery = useEmployees({
    page: 1,
    limit: 100,
    status: 'ACTIVE',
    search: deferredSearch || undefined,
    sort: 'fullName',
  })
  const assignmentsQuery = useEmployeeAssignments(employeeId || null)
  const typesQuery = useQuery(
    incidentTypesQueryOptions({ page: 1, limit: 100, isActive: true }),
  )
  const employeeOptions = (employeesQuery.data?.items ?? []).map((employee) => ({
    id: employee.id,
    fullName: employee.fullName,
    employeeNumber: employee.employeeNumber,
  }))

  if (
    selectedEmployee &&
    !employeeOptions.some((employee) => employee.id === selectedEmployee.id)
  ) {
    employeeOptions.unshift(selectedEmployee)
  }

  const selectedAssignment = assignmentsQuery.data?.find(
    (assignment) => assignment.id === assignmentId,
  )
  const assignmentItems = (assignmentsQuery.data ?? []).map((assignment) => ({
    value: assignment.id,
    label: `${assignment.position.name} · ${assignment.organizationalUnit.name}`,
  }))
  const eligibleTypes = (typesQuery.data?.items ?? []).filter(
    (type) =>
      !selectedAssignment ||
      type.appointmentScope === 'ALL' ||
      type.appointmentScope === selectedAssignment.appointmentType,
  )
  const typeItems = eligibleTypes.map((type) => ({
    value: type.id,
    label: type.name,
  }))

  function selectEmployee(employee: EmployeeOption | null) {
    setSelectedEmployee(employee)
    setValue('employeeId', employee?.id ?? '', { shouldValidate: true })
    setValue('employeeAssignmentId', '', { shouldValidate: true })
    setValue('incidentTypeId', '', { shouldValidate: true })
  }

  function selectAssignment(value: string | null) {
    const assignment = assignmentsQuery.data?.find((item) => item.id === value)
    setValue('employeeAssignmentId', value ?? '', { shouldValidate: true })
    setValue('assignmentEffectiveFrom', assignment?.effectiveFrom ?? '', {
      shouldValidate: true,
    })
    setValue('assignmentEffectiveTo', assignment?.effectiveTo ?? null, {
      shouldValidate: true,
    })
    setValue('incidentTypeId', '', { shouldValidate: true })
  }

  function selectType(value: string | null) {
    const incidentType = eligibleTypes.find((type) => type.id === value)
    setValue('incidentTypeId', value ?? '', { shouldValidate: true })
    setValue('incidentTypeCode', incidentType?.code ?? '')

    if (incidentType?.code !== 'COMISION') {
      setValue('commissionAnnex', null)
    }

    if (!incidentType) return

    setValue('temporalMode', incidentType.temporalMode, {
      shouldValidate: true,
    })
    setValue(
      'occurrences',
      [
        {
          startDate: '',
          endDate: incidentType.temporalMode === 'DATE_RANGE' ? '' : null,
        },
      ],
      { shouldValidate: true },
    )
  }

  return {
    assignmentId,
    assignmentItems,
    assignmentsQuery,
    control,
    employeeId,
    employeeOptions,
    employeesQuery,
    errors,
    hasCatalogError:
      employeesQuery.isError || assignmentsQuery.isError || typesQuery.isError,
    selectedAssignment,
    selectedEmployee,
    selectAssignment,
    selectEmployee,
    selectType,
    setEmployeeSearch,
    typeItems,
    typesQuery,
  }
}
