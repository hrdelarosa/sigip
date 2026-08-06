import type {
  EmployeeAssignmentResponse,
  EmployeeResponse,
} from '@sigip/shared';
import type { EmployeeModel } from '../models/employee.model';
import type { EmployeeAssignmentModel } from '../models/employee-assignment.model';

export function toEmployeeResponse(employee: EmployeeModel): EmployeeResponse {
  return {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    fullName: employee.fullName,
    hireDate: employee.hireDate
      ? employee.hireDate.toISOString().slice(0, 10)
      : null,
    status: employee.status,
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
  };
}

export function toEmployeeAssignmentResponse(
  assignment: EmployeeAssignmentModel,
): EmployeeAssignmentResponse {
  return {
    id: assignment.id,
    employeeId: assignment.employeeId,
    organizationalUnitId: assignment.organizationalUnitId,
    positionId: assignment.positionId,
    appointmentType: assignment.appointmentType,
    schedule: assignment.schedule,
    effectiveFrom: assignment.effectiveFrom.toISOString().slice(0, 10),
    effectiveTo: assignment.effectiveTo
      ? assignment.effectiveTo.toISOString().slice(0, 10)
      : null,
    notes: assignment.notes,
    createdAt: assignment.createdAt.toISOString(),
    updatedAt: assignment.updatedAt.toISOString(),
  };
}
