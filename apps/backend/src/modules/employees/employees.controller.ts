import {
  Body,
  Controller,
  Get,
  ForbiddenException,
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
  EmployeeVacationAdjustmentResponse,
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
  toEmployeeVacationAdjustmentResponse,
} from './presenters/employee.presenter';
import { ListEmployeesQueryDto } from './dto/list-employees-query.dto';
import { toPaginatedResponse } from '../../common/pagination/presenters/pagination.presenter';
import { EmployeeAssignmentIdParamDto } from './dto/employee-assignment-id-param.dto';
import { CreateEmployeeAssignmentDto } from './dto/create-employee-assignment.dto';
import { UpdateEmployeeAssignmentDto } from './dto/update-employee-assignment.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  EmployeeApiResponse,
  EmployeeAssignmentApiResponse,
  EmployeeDetailsApiResponse,
  EmployeesApiResponse,
} from '../../common/swagger/api.models';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { CreateVacationAdjustmentDto } from './dto/create-vacation-adjustment.dto';

@Controller('employees')
@ApiTags('Employees')
@RequirePermissions('employees:read')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar empleados con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE'] })
  @ApiQuery({ name: 'organizationalUnitId', required: false, format: 'uuid' })
  @ApiQuery({ name: 'positionId', required: false, format: 'uuid' })
  @ApiQuery({ name: 'sort', required: false, type: String })
  @ApiOkResponse({ type: EmployeesApiResponse })
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
  @ApiOperation({ summary: 'Obtener el detalle de un empleado' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: EmployeeDetailsApiResponse })
  @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
  async findById(
    @Param() params: EmployeeIdParamDto,
  ): Promise<EmployeeDetailsResponse> {
    const { employee, assignments, controls } =
      await this.employeesService.findDetails(params.id);

    return toEmployeeDetailsResponse(employee, assignments, controls);
  }

  @Post(':id/vacation-adjustments')
  @RequirePermissions('employees:update')
  @ApiOperation({ summary: 'Registrar un ajuste de consumo vacacional' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiCreatedResponse({ description: 'Ajuste vacacional registrado' })
  async createVacationAdjustment(
    @Param() params: EmployeeIdParamDto,
    @Body() dto: CreateVacationAdjustmentDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<EmployeeVacationAdjustmentResponse> {
    const adjustment = await this.employeesService.createVacationAdjustment(
      params.id,
      dto,
      actor,
    );

    return toEmployeeVacationAdjustmentResponse(adjustment);
  }

  @Post()
  @RequirePermissions('employees:create')
  @ApiOperation({ summary: 'Crear un empleado' })
  @ApiCreatedResponse({ type: EmployeeApiResponse })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async create(@Body() dto: CreateEmployeeDto): Promise<EmployeeResponse> {
    const employee = await this.employeesService.create(dto);

    return toEmployeeResponse(employee);
  }

  @Patch(':id')
  @RequirePermissions('employees:update')
  @ApiOperation({ summary: 'Actualizar un empleado' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: EmployeeApiResponse })
  @ApiNotFoundResponse({ description: 'Empleado no encontrado' })
  async update(
    @Param() params: EmployeeIdParamDto,
    @Body() dto: UpdateEmployeeDto,
  ): Promise<EmployeeResponse> {
    const employee = await this.employeesService.update(params.id, dto);

    return toEmployeeResponse(employee);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado de un empleado' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: EmployeeApiResponse })
  async updateStatus(
    @Param() params: EmployeeIdParamDto,
    @Body() dto: UpdateEmployeeStatusDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<EmployeeResponse> {
    const permission =
      dto.status === 'ACTIVE' ? 'employees:activate' : 'employees:deactivate';
    if (!actor.permissions.includes(permission)) {
      throw new ForbiddenException('Permisos insuficientes');
    }
    const employee = await this.employeesService.updateStatus(params.id, dto);

    return toEmployeeResponse(employee);
  }

  @Get(':id/assignments')
  @ApiOperation({ summary: 'Listar las asignaciones de un empleado' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: EmployeeAssignmentApiResponse, isArray: true })
  async findAssignments(
    @Param() params: EmployeeIdParamDto,
  ): Promise<EmployeeAssignmentsResponse> {
    const assignments = await this.employeesService.findAssignments(params.id);

    return assignments.map(toEmployeeAssignmentResponse);
  }

  @Get(':employeeId/assignments/:assignmentId')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiParam({ name: 'employeeId', format: 'uuid' })
  @ApiParam({ name: 'assignmentId', format: 'uuid' })
  @ApiOkResponse({ type: EmployeeAssignmentApiResponse })
  @ApiNotFoundResponse({ description: 'Asignación no encontrada' })
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
  @RequirePermissions('employees:update')
  @ApiOperation({ summary: 'Crear una asignación para un empleado' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiCreatedResponse({ type: EmployeeAssignmentApiResponse })
  @ApiBadRequestResponse({ description: 'Datos de asignación inválidos' })
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
  @RequirePermissions('employees:update')
  @ApiOperation({ summary: 'Actualizar una asignación' })
  @ApiParam({ name: 'employeeId', format: 'uuid' })
  @ApiParam({ name: 'assignmentId', format: 'uuid' })
  @ApiOkResponse({ type: EmployeeAssignmentApiResponse })
  @ApiNotFoundResponse({ description: 'Asignación no encontrada' })
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
