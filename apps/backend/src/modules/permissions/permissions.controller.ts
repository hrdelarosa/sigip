import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionIdParamDto } from './dto/permission-id-param.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findById(@Param() params: PermissionIdParamDto) {
    return this.permissionsService.findById(params.id);
  }

  @Post()
  create(@Body() dto: CreatePermissionDto) {
    return this.permissionsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param() params: PermissionIdParamDto,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(params.id, dto);
  }
}
