import type {
  PositionDetailsResponse,
  PositionEmployeeResponse,
  PositionResponse,
} from '@sigip/shared';
import type {
  PositionDetailsModel,
  PositionEmployeeModel,
  PositionModel,
} from '../models/position.model';

export function toPositionResponse(position: PositionModel): PositionResponse {
  return {
    id: position.id,
    officeId: position.officeId,
    code: position.code,
    name: position.name,
    description: position.description ?? null,
    isActive: position.isActive,
    createdAt: position.createdAt.toISOString(),
    updatedAt: position.updatedAt.toISOString(),
  };
}

export function toPositionEmployeeResponse(
  employee: PositionEmployeeModel,
): PositionEmployeeResponse {
  return {
    id: employee.id,
    employeeNumber: employee.employeeNumber,
    fullName: employee.fullName,
    status: employee.status,
  };
}

export function toPositionDetailsResponse(
  position: PositionDetailsModel,
): PositionDetailsResponse {
  return {
    ...toPositionResponse(position),
    assignmentCount: position.assignmentCount,
    employees: position.employees.map(toPositionEmployeeResponse),
  };
}
