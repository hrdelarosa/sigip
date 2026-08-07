import { Injectable } from '@nestjs/common';

import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  EmployeeAssignmentNotFoundError,
  EmployeeNotFoundError,
  EmployeeNumberAlreadyExistsError,
  EmployeePersistenceError,
  EmptyEmployeeAssignmentUpdateError,
  EmptyEmployeeUpdateError,
  InvalidAdministrativeDateError,
  InvalidAssignmentPeriodError,
  InvalidEmployeeAssignmentReferenceError,
  OrganizationalUnitNotAvailableError,
  OverlappingEmployeeAssignmentError,
  PositionNotAvailableError,
} from './employees.errors';
import { EmployeesRepository } from './repositories/employees.repository';
import { ListEmployeesQueryDto } from './dto/list-employees-query.dto';
import type { PaginatedResult } from '../../common/pagination/types/pagination.types';
import { EmployeeModel } from './models/employee.model';
import { EmployeeAssignmentModel } from './models/employee-assignment.model';
import { CreateEmployeeAssignmentDto } from './dto/create-employee-assignment.dto';
import { UpdateEmployeeAssignmentDto } from './dto/update-employee-assignment.dto';
import { hasMysqlErrorCode } from '../../database/utils/mysql-error.util';
import type { EmployeeAssignmentMutationResult } from './types/employees.types';

@Injectable()
export class EmployeesService {
  constructor(private readonly employeesRepository: EmployeesRepository) {}

  private parseDate(value: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new InvalidAdministrativeDateError();
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    if (
      Number.isNaN(date.getTime()) ||
      date.toISOString().slice(0, 10) !== value
    ) {
      throw new InvalidAdministrativeDateError();
    }

    return date;
  }

  private parseNullableDate(value?: string | null): Date | null {
    return value ? this.parseDate(value) : null;
  }

  private async ensureEmployeeNumberAvailable(
    employeeNumber: string,
    excludeId?: string,
  ): Promise<void> {
    const existing =
      await this.employeesRepository.findByEmployeeNumber(employeeNumber);

    if (existing && existing.id !== excludeId)
      throw new EmployeeNumberAlreadyExistsError(employeeNumber);
  }

  private validateAssignmentPeriod(
    effectiveFrom: Date,
    effectiveTo: Date | null,
  ): void {
    if (effectiveTo && effectiveTo.getTime() < effectiveFrom.getTime()) {
      throw new InvalidAssignmentPeriodError();
    }
  }

  private handleEmployeePersistenceError(
    error: unknown,
    employeeNumber: string,
  ): never {
    if (hasMysqlErrorCode(error, 'ER_DUP_ENTRY')) {
      throw new EmployeeNumberAlreadyExistsError(employeeNumber);
    }

    throw new EmployeePersistenceError();
  }

  private handleAssignmentPersistenceError(error: unknown): never {
    if (hasMysqlErrorCode(error, 'ER_NO_REFERENCED_ROW_2')) {
      throw new InvalidEmployeeAssignmentReferenceError();
    }

    if (hasMysqlErrorCode(error, 'ER_CHECK_CONSTRAINT_VIOLATED')) {
      throw new InvalidAssignmentPeriodError();
    }

    throw new EmployeePersistenceError();
  }

  private unwrapAssignmentResult(
    result: EmployeeAssignmentMutationResult,
    employeeId: string,
    assignmentId?: string,
  ): EmployeeAssignmentModel {
    switch (result.status) {
      case 'success':
        return result.assignment;
      case 'employee-not-found':
        throw new EmployeeNotFoundError(employeeId);
      case 'assignment-not-found':
        if (assignmentId) {
          throw new EmployeeAssignmentNotFoundError(assignmentId);
        }
        throw new EmployeePersistenceError();
      case 'organizational-unit-not-available':
        throw new OrganizationalUnitNotAvailableError();
      case 'position-not-available':
        throw new PositionNotAvailableError();
      case 'invalid-period':
        throw new InvalidAssignmentPeriodError();
      case 'overlap':
        throw new OverlappingEmployeeAssignmentError();
    }
  }

  async findAll(
    query: ListEmployeesQueryDto,
  ): Promise<PaginatedResult<EmployeeModel>> {
    return this.employeesRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      sort: query.sort,
      status: query.status,
      organizationalUnitId: query.organizationalUnitId,
      positionId: query.positionId,
    });
  }

  async findById(id: string): Promise<EmployeeModel> {
    const employee = await this.employeesRepository.findById(id);

    if (!employee) throw new EmployeeNotFoundError(id);

    return employee;
  }

  async findDetails(id: string): Promise<{
    employee: EmployeeModel;
    assignments: EmployeeAssignmentModel[];
  }> {
    const employee = await this.findById(id);
    const assignments =
      await this.employeesRepository.findAssignmentsByEmployeeId(id);

    return { employee, assignments };
  }

  async create(dto: CreateEmployeeDto): Promise<EmployeeModel> {
    const employeeNumber = dto.employeeNumber.trim();
    const fullName = dto.fullName.trim();

    await this.ensureEmployeeNumberAvailable(employeeNumber);

    try {
      return await this.employeesRepository.create({
        id: generateUuidV7(),
        employeeNumber,
        fullName,
        hireDate: this.parseNullableDate(dto.hireDate),
        status: 'ACTIVE',
      });
    } catch (error) {
      this.handleEmployeePersistenceError(error, employeeNumber);
    }
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    if (
      dto.employeeNumber === undefined &&
      dto.fullName === undefined &&
      dto.hireDate === undefined
    ) {
      throw new EmptyEmployeeUpdateError();
    }

    const current = await this.findById(id);
    const employeeNumber = dto.employeeNumber?.trim();

    if (employeeNumber && employeeNumber !== current.employeeNumber) {
      await this.ensureEmployeeNumberAvailable(employeeNumber, id);
    }

    let updatedEmployee: EmployeeModel | null;

    try {
      updatedEmployee = await this.employeesRepository.update(id, {
        employeeNumber,
        fullName: dto.fullName,
        hireDate:
          dto.hireDate !== undefined
            ? this.parseNullableDate(dto.hireDate)
            : undefined,
        updatedAt: new Date(),
      });
    } catch (error) {
      this.handleEmployeePersistenceError(
        error,
        employeeNumber ?? current.employeeNumber,
      );
    }

    if (!updatedEmployee) throw new EmployeeNotFoundError(id);

    return updatedEmployee;
  }

  async updateStatus(id: string, dto: UpdateEmployeeStatusDto) {
    const employee = await this.findById(id);

    if (employee.status === dto.status) return employee;

    let updatedEmployee: EmployeeModel | null;

    try {
      updatedEmployee = await this.employeesRepository.updateStatus(
        id,
        dto.status,
        new Date(),
      );
    } catch {
      throw new EmployeePersistenceError();
    }

    if (!updatedEmployee) throw new EmployeeNotFoundError(id);

    return updatedEmployee;
  }

  async findAssignments(
    employeeId: string,
  ): Promise<EmployeeAssignmentModel[]> {
    await this.findById(employeeId);

    return this.employeesRepository.findAssignmentsByEmployeeId(employeeId);
  }

  async findAssignmentsById(
    employeeId: string,
    assignmentId: string,
  ): Promise<EmployeeAssignmentModel> {
    await this.findById(employeeId);

    const assignment = await this.employeesRepository.findAssignmentById(
      employeeId,
      assignmentId,
    );

    if (!assignment) throw new EmployeeAssignmentNotFoundError(assignmentId);

    return assignment;
  }

  async createAssignment(
    employeeId: string,
    dto: CreateEmployeeAssignmentDto,
  ): Promise<EmployeeAssignmentModel> {
    const effectiveFrom = this.parseDate(dto.effectiveFrom);
    const effectiveTo = this.parseNullableDate(dto.effectiveTo);

    this.validateAssignmentPeriod(effectiveFrom, effectiveTo);

    let result: EmployeeAssignmentMutationResult;

    try {
      result = await this.employeesRepository.createAssignment({
        id: generateUuidV7(),
        employeeId,
        organizationalUnitId: dto.organizationalUnitId,
        positionId: dto.positionId,
        appointmentType: dto.appointmentType,
        schedule: dto.schedule ?? null,
        effectiveFrom,
        effectiveTo,
        notes: dto.notes ?? null,
      });
    } catch (error) {
      this.handleAssignmentPersistenceError(error);
    }

    return this.unwrapAssignmentResult(result, employeeId);
  }

  async updateAssignment(
    employeeId: string,
    assignmentId: string,
    dto: UpdateEmployeeAssignmentDto,
  ): Promise<EmployeeAssignmentModel> {
    if (
      dto.organizationalUnitId === undefined &&
      dto.positionId === undefined &&
      dto.appointmentType === undefined &&
      dto.schedule === undefined &&
      dto.effectiveFrom === undefined &&
      dto.effectiveTo === undefined &&
      dto.notes === undefined
    ) {
      throw new EmptyEmployeeAssignmentUpdateError();
    }

    const effectiveFrom = dto.effectiveFrom
      ? this.parseDate(dto.effectiveFrom)
      : undefined;
    const effectiveTo =
      dto.effectiveTo !== undefined
        ? this.parseNullableDate(dto.effectiveTo)
        : undefined;
    let result: EmployeeAssignmentMutationResult;

    try {
      result = await this.employeesRepository.updateAssignment(
        employeeId,
        assignmentId,
        {
          organizationalUnitId: dto.organizationalUnitId,
          positionId: dto.positionId,
          appointmentType: dto.appointmentType,
          schedule: dto.schedule,
          effectiveFrom,
          effectiveTo,
          notes: dto.notes,
          updatedAt: new Date(),
        },
      );
    } catch (error) {
      this.handleAssignmentPersistenceError(error);
    }

    return this.unwrapAssignmentResult(result, employeeId, assignmentId);
  }
}
