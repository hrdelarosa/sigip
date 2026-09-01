import { EmployeeStatus } from '@sigip/shared';

export interface PositionModel {
  id: string;
  officeId: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PositionEmployeeModel {
  id: string;
  employeeNumber: string;
  fullName: string;
  status: EmployeeStatus;
}

export interface PositionDetailsModel extends PositionModel {
  assignmentCount: number;
  employees: PositionEmployeeModel[];
}
