import { Controller, Get, Post, Body, Patch, Param, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleIdParamDto } from './dto/role-id-param.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';
import {
  toRoleResponse,
  toPermissionSummaryResponse,
} from './presenters/role.presenter';
import type {
  RoleResponse,
  PermissionSummaryResponse,
  RolePermissionsResponse,
} from '@sigip/shared';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  PermissionSummaryApiResponse,
  RoleApiResponse,
  RolePermissionsApiResponse,
} from '../../common/swagger/api.models';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@Controller('roles')
@ApiTags('Roles')
@RequirePermissions('roles:read')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar roles' })
  @ApiOkResponse({ type: RoleApiResponse, isArray: true })
  async findAll(): Promise<RoleResponse[]> {
    const roles = await this.rolesService.findAll();

    return roles.map(toRoleResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol por ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: RoleApiResponse })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  async findById(@Param() params: RoleIdParamDto): Promise<RoleResponse> {
    const role = await this.rolesService.findById(params.id);

    return toRoleResponse(role);
  }

  @Post()
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Crear un rol' })
  @ApiCreatedResponse({ type: RoleApiResponse })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async create(@Body() dto: CreateRoleDto): Promise<RoleResponse> {
    const role = await this.rolesService.create(dto);

    return toRoleResponse(role);
  }

  @Patch(':id')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Actualizar un rol' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: RoleApiResponse })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  async update(
    @Param() params: RoleIdParamDto,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleResponse> {
    const role = await this.rolesService.update(params.id, dto);

    return toRoleResponse(role);
  }

  @Patch(':id/status')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Activar o desactivar un rol' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: RoleApiResponse })
  async updateStatus(
    @Param() params: RoleIdParamDto,
    @Body() dto: UpdateRoleStatusDto,
  ): Promise<RoleResponse> {
    const role = await this.rolesService.updateStatus(params.id, dto);

    return toRoleResponse(role);
  }

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Consultar los permisos de un rol' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: RolePermissionsApiResponse })
  @ApiNotFoundResponse({ description: 'Rol no encontrado' })
  async findPermissions(
    @Param() params: RoleIdParamDto,
  ): Promise<RolePermissionsResponse> {
    const result = await this.rolesService.findPermissions(params.id);

    return {
      role: toRoleResponse(result.role),
      permissions: result.permissions.map(toPermissionSummaryResponse),
    };
  }

  @Put(':id/permissions')
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Reemplazar los permisos de un rol' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PermissionSummaryApiResponse, isArray: true })
  @ApiBadRequestResponse({ description: 'Permisos inválidos' })
  async replacePermissions(
    @Param() params: RoleIdParamDto,
    @Body() dto: ReplaceRolePermissionsDto,
  ): Promise<PermissionSummaryResponse[]> {
    const permissions = await this.rolesService.replacePermissions(
      params.id,
      dto,
    );

    return permissions.map(toPermissionSummaryResponse);
  }
}
