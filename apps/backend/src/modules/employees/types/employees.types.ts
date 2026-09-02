import type { EmployeeStatus } from '@sigip/shared';
import type { AppointmentType } from '../../../database/schema/organization/employee-assignments.schema';
import type { EmployeeAssignmentDetailsModel } from '../models/employee-assignment.model';

export interface EmployeeFilters {
  page: number;
  limit: number;
  search?: string;
  sort?: string;
  status?: EmployeeStatus;
  organizationalUnitId?: string;
  positionId?: string;
  officeId?: string;
}

export interface CreateEmployeeData {
  id: string;
  officeId: string;
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
  officeId?: string;
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

export type EmployeeAssignmentMutationResult =
  | { status: 'success'; assignment: EmployeeAssignmentDetailsModel }
  | { status: 'employee-not-found' }
  | { status: 'employee-inactive' }
  | { status: 'assignment-not-found' }
  | { status: 'organizational-unit-not-available' }
  | { status: 'position-not-available' }
  | { status: 'invalid-period' }
  | { status: 'overlap' };
