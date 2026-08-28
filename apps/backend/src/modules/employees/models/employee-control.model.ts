import type { VacationPeriod } from '@sigip/shared';

export interface EmployeeVacationAdjustmentModel {
  id: string;
  employeeId: string;
  year: number;
  period: VacationPeriod;
  daysDelta: number;
  reason: string;
  createdBy: {
    id: string;
    fullName: string;
  };
  createdAt: Date;
}

export interface EmployeeControlSnapshot {
  vacationDates: Array<{ code: string; date: Date }>;
  justificationDates: Array<{ code: string; date: Date }>;
  adjustments: EmployeeVacationAdjustmentModel[];
}
