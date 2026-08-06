import { Injectable } from '@nestjs/common';

import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  EmployeeAssignmentNotFoundError,
  EmployeeNotFoundError,
  EmployeeNumberAlreadyExistsError,
  InvalidAssignmentPeriodError,
  OrganizationalUnitNotAvailableError,
  OverlappingEmployeeAssignmentError,
  PositionNotAvailableError,
} from './employees.errors';
import { EmployeesRepository } from './repositories/employees.repository';
import { ListEmployeesQueryDto } from './dto/list-employees-query.dto';
import type { PaginatedResult } from '../../common/pagination/types/pagination.types';
import { EmployeeModel } from './models/employee.model';
import { OrganizationalUnitsService } from '../organizational-units/organizational-units.service';
import { PositionsService } from '../positions/positions.service';
import { EmployeeAssignmentModel } from './models/employee-assignment.model';
import { CreateEmployeeAssignmentDto } from './dto/create-employee-assignment.dto';
import { UpdateEmployeeAssignmentDto } from './dto/update-employee-assignment.dto';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly employeesRepository: EmployeesRepository,
    private readonly organizationalUnitsService: OrganizationalUnitsService,
    private readonly positionsService: PositionsService,
  ) {}

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00.000Z`);
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

  private async validateAssignmentCatalogs(
    organizationalUnitId: string,
    positionId: string,
  ): Promise<void> {
    const unit =
      await this.organizationalUnitsService.findById(organizationalUnitId);

    if (!unit.isActive) throw new OrganizationalUnitNotAvailableError();

    const position = await this.positionsService.findById(positionId);

    if (!position.isActive) throw new PositionNotAvailableError();
  }

  private validateAssignmentPeriod(
    effectiveFrom: Date,
    effectiveTo: Date | null,
  ): void {
    if (effectiveTo && effectiveTo.getTime() < effectiveFrom.getTime()) {
      throw new InvalidAssignmentPeriodError();
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

  async create(dto: CreateEmployeeDto): Promise<EmployeeModel> {
    const employeeNumber = dto.employeeNumber.trim();
    const fullName = dto.fullName.trim();

    await this.ensureEmployeeNumberAvailable(employeeNumber);

    return this.employeesRepository.create({
      id: generateUuidV7(),
      employeeNumber,
      fullName,
      hireDate: this.parseNullableDate(dto.hireDate),
      status: 'ACTIVE',
    });
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    const current = await this.findById(id);
    const employeeNumber = dto.employeeNumber?.trim();

    if (employeeNumber && employeeNumber !== current.employeeNumber) {
      await this.ensureEmployeeNumberAvailable(employeeNumber, id);
    }

    const updatedEmployee = await this.employeesRepository.update(id, {
      employeeNumber,
      fullName: dto.fullName?.trim(),
      hireDate:
        dto.hireDate !== undefined
          ? this.parseNullableDate(dto.hireDate)
          : undefined,
      updatedAt: new Date(),
    });

    if (!updatedEmployee) throw new EmployeeNotFoundError(id);

    return updatedEmployee;
  }

  async updateStatus(id: string, dto: UpdateEmployeeStatusDto) {
    const employee = await this.findById(id);

    if (employee.status === dto.status) return employee;

    const updatedEmployee = await this.employeesRepository.updateStatus(
      id,
      dto.status,
      new Date(),
    );

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

    if (!assignment) throw new EmployeeAssignmentNotFoundError(employeeId);

    return assignment;
  }

  async createAssignment(
    employeeId: string,
    dto: CreateEmployeeAssignmentDto,
  ): Promise<EmployeeAssignmentModel> {
    await this.findById(employeeId);

    const effectiveFrom = this.parseDate(dto.effectiveFrom);
    const effectiveTo = this.parseNullableDate(dto.effectiveTo);

    this.validateAssignmentPeriod(effectiveFrom, effectiveTo);

    await this.validateAssignmentCatalogs(
      dto.organizationalUnitId,
      dto.positionId,
    );

    const overlaps = await this.employeesRepository.hasOverlappingAssignment(
      employeeId,
      effectiveFrom,
      effectiveTo,
    );

    if (overlaps) throw new OverlappingEmployeeAssignmentError();

    return this.employeesRepository.createAssignment({
      id: generateUuidV7(),
      employeeId,
      organizationalUnitId: dto.organizationalUnitId,
      positionId: dto.positionId,
      appointmentType: dto.appointmentType,
      schedule: dto.schedule?.trim() ?? null,
      effectiveFrom,
      effectiveTo,
      notes: dto.notes?.trim() ?? null,
    });
  }

  async updateAssignment(
    employeeId: string,
    assignmentId: string,
    dto: UpdateEmployeeAssignmentDto,
  ): Promise<EmployeeAssignmentModel> {
    const current = await this.findAssignmentsById(employeeId, assignmentId);

    const effectiveFrom = dto.effectiveFrom
      ? this.parseDate(dto.effectiveFrom)
      : current.effectiveFrom;
    const effectiveTo =
      dto.effectiveTo !== undefined
        ? this.parseNullableDate(dto.effectiveTo)
        : current.effectiveTo;

    this.validateAssignmentPeriod(effectiveFrom, effectiveTo);

    const organizationalUnitId =
      dto.organizationalUnitId ?? current.organizationalUnitId;
    const positionId = dto.positionId ?? current.positionId;

    await this.validateAssignmentCatalogs(organizationalUnitId, positionId);

    const overlaps = await this.employeesRepository.hasOverlappingAssignment(
      employeeId,
      effectiveFrom,
      effectiveTo,
      assignmentId,
    );

    if (overlaps) throw new OverlappingEmployeeAssignmentError();

    const assignment = await this.employeesRepository.updateAssignment(
      employeeId,
      assignmentId,
      {
        organizationalUnitId: dto.organizationalUnitId,
        positionId: dto.positionId,
        appointmentType: dto.appointmentType,
        schedule:
          dto.schedule !== undefined ? dto.schedule?.trim() || null : undefined,
        effectiveFrom:
          dto.effectiveFrom !== undefined ? effectiveFrom : undefined,
        effectiveTo: dto.effectiveTo !== undefined ? effectiveTo : undefined,
        notes: dto.notes !== undefined ? dto.notes?.trim() || null : undefined,
        updatedAt: new Date(),
      },
    );

    if (!assignment) throw new EmployeeAssignmentNotFoundError(employeeId);

    return assignment;
  }
}
