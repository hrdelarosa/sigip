import type {
  EmployeeAssignmentResponse,
  EmployeeDetailsResponse,
  EmployeeResponse,
  EmployeeVacationAdjustmentResponse,
} from '@sigip/shared';
import type { EmployeeModel } from '../models/employee.model';
import type { EmployeeAssignmentDetailsModel } from '../models/employee-assignment.model';
import type { EmployeeVacationAdjustmentModel } from '../models/employee-control.model';
import type { buildEmployeeControls } from '../employee-controls';

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
  assignment: EmployeeAssignmentDetailsModel,
): EmployeeAssignmentResponse {
  return {
    id: assignment.id,
    employeeId: assignment.employeeId,
    organizationalUnitId: assignment.organizationalUnitId,
    positionId: assignment.positionId,
    organizationalUnit: assignment.organizationalUnit,
    position: assignment.position,
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

export function toEmployeeDetailsResponse(
  employee: EmployeeModel,
  assignments: EmployeeAssignmentDetailsModel[],
  controls: ReturnType<typeof buildEmployeeControls>,
): EmployeeDetailsResponse {
  return {
    ...toEmployeeResponse(employee),
    assignments: assignments.map(toEmployeeAssignmentResponse),
    ...controls,
  };
}

export function toEmployeeVacationAdjustmentResponse(
  adjustment: EmployeeVacationAdjustmentModel,
): EmployeeVacationAdjustmentResponse {
  return {
    id: adjustment.id,
    year: adjustment.year,
    period: adjustment.period,
    daysDelta: adjustment.daysDelta,
    reason: adjustment.reason,
    createdBy: adjustment.createdBy,
    createdAt: adjustment.createdAt.toISOString(),
  };
}
