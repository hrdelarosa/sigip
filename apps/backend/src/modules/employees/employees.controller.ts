import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type {
  EmployeeAssignmentResponse,
  EmployeeAssignmentsResponse,
  EmployeeDetailsResponse,
  EmployeeResponse,
  EmployeesResponse,
} from '@sigip/shared';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeeIdParamDto } from './dto/employee-id-param.dto';
import { UpdateEmployeeStatusDto } from './dto/update-employee-status.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';
import {
  toEmployeeAssignmentResponse,
  toEmployeeDetailsResponse,
  toEmployeeResponse,
} from './presenters/employee.presenter';
import { ListEmployeesQueryDto } from './dto/list-employees-query.dto';
import { toPaginatedResponse } from '../../common/pagination/presenters/pagination.presenter';
import { EmployeeAssignmentIdParamDto } from './dto/employee-assignment-id-param.dto';
import { CreateEmployeeAssignmentDto } from './dto/create-employee-assignment.dto';
import { UpdateEmployeeAssignmentDto } from './dto/update-employee-assignment.dto';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  async findAll(
    @Query() query: ListEmployeesQueryDto,
  ): Promise<EmployeesResponse> {
    const result = await this.employeesService.findAll(query);

    return toPaginatedResponse(
      result.items,
      result.total,
      query.page,
      query.limit,
      toEmployeeResponse,
    );
  }

  @Get(':id')
  async findById(
    @Param() params: EmployeeIdParamDto,
  ): Promise<EmployeeDetailsResponse> {
    const { employee, assignments } = await this.employeesService.findDetails(
      params.id,
    );

    return toEmployeeDetailsResponse(employee, assignments);
  }

  @Post()
  async create(@Body() dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    const employee = await this.employeesService.create(dto);

    return toEmployeeResponse(employee);
  }

  @Patch(':id')
  async update(
    @Param() params: EmployeeIdParamDto,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponse> {
    const employee = await this.employeesService.update(params.id, dto);

    return toEmployeeResponse(employee);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param() params: EmployeeIdParamDto,
    @Body() dto: UpdateEmployeeStatusDto,
  ): Promise<EmployeeResponse> {
    const employee = await this.employeesService.updateStatus(params.id, dto);

    return toEmployeeResponse(employee);
  }

  @Get(':id/assignments')
  async findAssignments(
    @Param() params: EmployeeIdParamDto,
  ): Promise<EmployeeAssignmentsResponse> {
    const assignments = await this.employeesService.findAssignments(params.id);

    return assignments.map(toEmployeeAssignmentResponse);
  }

  @Get(':employeeId/assignments/:assignmentId')
  async findAssignment(
    @Param() params: EmployeeAssignmentIdParamDto,
  ): Promise<EmployeeAssignmentResponse> {
    const assignment = await this.employeesService.findAssignmentsById(
      params.employeeId,
      params.assignmentId,
    );

    return toEmployeeAssignmentResponse(assignment);
  }

  @Post(':id/assignments')
  async createAssignment(
    @Param() params: EmployeeIdParamDto,
    @Body() dto: CreateEmployeeAssignmentDto,
  ): Promise<EmployeeAssignmentResponse> {
    const assignment = await this.employeesService.createAssignment(
      params.id,
      dto,
    );

    return toEmployeeAssignmentResponse(assignment);
  }

  @Patch(':employeeId/assignments/:assignmentId')
  async updateAssignment(
    @Param() params: EmployeeAssignmentIdParamDto,
    @Body() dto: UpdateEmployeeAssignmentDto,
  ): Promise<EmployeeAssignmentResponse> {
    const assignment = await this.employeesService.updateAssignment(
      params.employeeId,
      params.assignmentId,
      dto,
    );

    return toEmployeeAssignmentResponse(assignment);
  }
}
