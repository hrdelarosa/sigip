import type { VacationPeriod } from '@sigip/shared';
import type { EmployeeVacationAdjustmentModel } from '../models/employee-control.model';

export interface CreateVacationAdjustmentData {
  id: string;
  employeeId: string;
  year: number;
  period: VacationPeriod;
  daysDelta: number;
  reason: string;
  createdBy: string;
  sessionId: string;
  createdAt: Date;
}

export type VacationAdjustmentMutationResult =
  | { status: 'success'; adjustment: EmployeeVacationAdjustmentModel }
  | { status: 'employee-not-found' }
  | { status: 'balance-out-of-range' }
  | { status: 'period-not-available' }
  | { status: 'not-eligible' };
