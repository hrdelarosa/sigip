import type { EmployeeStatus } from '@sigip/shared';
import type { AppointmentType } from '../../../database/schema/organization/employee-assignments.schema';

export interface EmployeeFilters {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  status?: EmployeeStatus;
  organizationalUnitId?: string;
  positionId?: string;
}

export interface CreateEmployeeData {
  id: string;
  employeeNumber: string;
  fullName: string;
  hireDate: Date | null;
  status: EmployeeStatus;
}

export interface UpdateEmployeeData {
  employeeNumber?: string;
  fullName?: string;
  hireDate?: Date | null;
  updatedAt: Date;
}

export interface CreateEmployeeAssignmentData {
  id: string;
  employeeId: string;
  organizationalUnitId: string;
  positionId: string;
  appointmentType: AppointmentType;
  schedule: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  notes: string | null;
}

export interface UpdateEmployeeAssignmentData {
  organizationalUnitId?: string;
  positionId?: string;
  appointmentType?: AppointmentType;
  schedule?: string | null;
  effectiveFrom?: Date;
  effectiveTo?: Date | null;
  notes?: string | null;
  updatedAt: Date;
}
