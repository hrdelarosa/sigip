import type { EmployeeStatus } from '@sigip/shared';

import type { PaginatedResult } from '../../../common/pagination/types/pagination.types';

import type { EmployeeAssignmentDetailsModel } from '../models/employee-assignment.model';

import type { EmployeeModel } from '../models/employee.model';
import {
  CreateEmployeeAssignmentData,
  CreateEmployeeData,
  EmployeeAssignmentMutationResult,
  EmployeeFilters,
  UpdateEmployeeAssignmentData,
  UpdateEmployeeData,
} from '../types/employees.types';

export abstract class EmployeesRepository {
  abstract findAll(
    filters: EmployeeFilters,
  ): Promise<PaginatedResult<EmployeeModel>>;
  abstract findById(id: string): Promise<EmployeeModel | null>;
  abstract findByEmployeeNumber(
    employeeNumber: string,
  ): Promise<EmployeeModel | null>;
  abstract create(data: CreateEmployeeData): Promise<EmployeeModel>;
  abstract update(
    id: string,
    data: UpdateEmployeeData,
  ): Promise<EmployeeModel | null>;
  abstract updateStatus(
    id: string,
    status: EmployeeStatus,
    updatedAt: Date,
  ): Promise<EmployeeModel | null>;

  abstract findAssignmentsByEmployeeId(
    employeeId: string,
  ): Promise<EmployeeAssignmentDetailsModel[]>;
  abstract findAssignmentById(
    employeeId: string,
    assignmentId: string,
  ): Promise<EmployeeAssignmentDetailsModel | null>;
  abstract createAssignment(
    data: CreateEmployeeAssignmentData,
  ): Promise<EmployeeAssignmentMutationResult>;
  abstract updateAssignment(
    employeeId: string,
    assignmentId: string,
    data: UpdateEmployeeAssignmentData,
  ): Promise<EmployeeAssignmentMutationResult>;
}
