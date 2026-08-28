import type {
  CreateEmployeeAssignmentInput,
  CreateEmployeeInput,
  Employee,
  EmployeeAssignment,
  EmployeeAssignments,
  EmployeeDetails,
  EmployeeListParams,
  Employees,
  UpdateEmployeeAssignmentInput,
  UpdateEmployeeInput,
  UpdateEmployeeStatusInput,
  CreateEmployeeVacationAdjustmentInput,
  EmployeeVacationAdjustment,
} from '../types/employee.types'

import { apiRequest } from '@/lib/api/api-client'

export function getEmployees(params: EmployeeListParams = {}): Promise<Employees> {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') searchParams.set(key, String(value))
  })

  const query = searchParams.toString()
  return apiRequest<Employees>(`/employees${query ? `?${query}` : ''}`)
}

export function getEmployeeById({
  id,
}: {
  id: string
}): Promise<EmployeeDetails> {
  return apiRequest<EmployeeDetails>(`/employees/${id}`)
}

export function createEmployee({
  input,
}: {
  input: CreateEmployeeInput
}): Promise<Employee> {
  return apiRequest<Employee>('/employees', {
    method: 'POST',
    body: input,
  })
}

export function updateEmployee({
  id,
  input,
}: {
  id: string
  input: UpdateEmployeeInput
}): Promise<Employee> {
  return apiRequest<Employee>(`/employees/${id}`, {
    method: 'PATCH',
    body: input,
  })
}

export function updateEmployeeStatus({
  id,
  input,
}: {
  id: string
  input: UpdateEmployeeStatusInput
}): Promise<Employee> {
  return apiRequest<Employee>(`/employees/${id}/status`, {
    method: 'PATCH',
    body: input,
  })
}

export function getEmployeeAssignments({
  employeeId,
}: {
  employeeId: string
}): Promise<EmployeeAssignments> {
  return apiRequest<EmployeeAssignments>(`/employees/${employeeId}/assignments`)
}

export function getEmployeeAssignmentById({
  employeeId,
  assignmentId,
}: {
  employeeId: string
  assignmentId: string
}): Promise<EmployeeAssignment> {
  return apiRequest<EmployeeAssignment>(
    `/employees/${employeeId}/assignments/${assignmentId}`,
  )
}

export function createEmployeeAssignment({
  employeeId,
  input,
}: {
  employeeId: string
  input: CreateEmployeeAssignmentInput
}): Promise<EmployeeAssignment> {
  return apiRequest<EmployeeAssignment>(
    `/employees/${employeeId}/assignments`,
    {
      method: 'POST',
      body: input,
    },
  )
}

export function updateEmployeeAssignment({
  employeeId,
  assignmentId,
  input,
}: {
  employeeId: string
  assignmentId: string
  input: UpdateEmployeeAssignmentInput
}): Promise<EmployeeAssignment> {
  return apiRequest<EmployeeAssignment>(
    `/employees/${employeeId}/assignments/${assignmentId}`,
    {
      method: 'PATCH',
      body: input,
    },
  )
}

export function createEmployeeVacationAdjustment({
  employeeId,
  input,
}: {
  employeeId: string
  input: CreateEmployeeVacationAdjustmentInput
}): Promise<EmployeeVacationAdjustment> {
  return apiRequest<EmployeeVacationAdjustment>(
    `/employees/${employeeId}/vacation-adjustments`,
    { method: 'POST', body: input },
  )
}
