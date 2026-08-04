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

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(): Promise<RoleResponse[]> {
    const roles = await this.rolesService.findAll();

    return roles.map(toRoleResponse);
  }

  @Get(':id')
  async findById(@Param() params: RoleIdParamDto): Promise<RoleResponse> {
    const role = await this.rolesService.findById(params.id);

    return toRoleResponse(role);
  }

  @Post()
  async create(@Body() dto: CreateRoleDto): Promise<RoleResponse> {
    const role = await this.rolesService.create(dto);

    return toRoleResponse(role);
  }

  @Patch(':id')
  async update(
    @Param() params: RoleIdParamDto,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleResponse> {
    const role = await this.rolesService.update(params.id, dto);

    return toRoleResponse(role);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param() params: RoleIdParamDto,
    @Body() dto: UpdateRoleStatusDto,
  ): Promise<RoleResponse> {
    const role = await this.rolesService.updateStatus(params.id, dto);

    return toRoleResponse(role);
  }

  @Get(':id/permissions')
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
