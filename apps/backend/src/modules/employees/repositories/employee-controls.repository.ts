import type { EmployeeControlSnapshot } from '../models/employee-control.model';
import type {
  CreateVacationAdjustmentData,
  VacationAdjustmentMutationResult,
} from '../types/employee-control.types';

export abstract class EmployeeControlsRepository {
  abstract findSnapshot(
    employeeId: string,
    officeId?: string,
  ): Promise<EmployeeControlSnapshot>;
  abstract createVacationAdjustment(
    data: CreateVacationAdjustmentData,
  ): Promise<VacationAdjustmentMutationResult>;
}
