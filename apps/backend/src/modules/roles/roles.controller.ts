import { Controller, Get, Post, Body, Patch, Param, Put } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleIdParamDto } from './dto/role-id-param.dto';
import { UpdateRoleStatusDto } from './dto/update-role-status.dto';
import { ReplaceRolePermissionsDto } from './dto/replace-role-permissions.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findById(@Param() params: RoleIdParamDto) {
    return this.rolesService.findById(params.id);
  }

  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  update(@Param() params: RoleIdParamDto, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(params.id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param() params: RoleIdParamDto,
    @Body() dto: UpdateRoleStatusDto,
  ) {
    return this.rolesService.updateStatus(params.id, dto);
  }

  @Get(':id/permissions')
  findPermissions(@Param() params: RoleIdParamDto) {
    return this.rolesService.findPermissions(params.id);
  }

  @Put(':id/permissions')
  replacePermissions(
    @Param() params: RoleIdParamDto,
    @Body() dto: ReplaceRolePermissionsDto,
  ) {
    return this.rolesService.replacePermissions(params.id, dto);
  }
}
