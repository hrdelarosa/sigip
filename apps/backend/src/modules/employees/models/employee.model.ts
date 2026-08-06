import type { EmployeeStatus } from '@sigip/shared';

export interface EmployeeModel {
  id: string;
  employeeNumber: string;
  fullName: string;
  hireDate: Date | null;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}
