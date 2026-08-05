import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionIdParamDto } from './dto/permission-id-param.dto';
import type {
  PermissionDetailsResponse,
  PermissionResponse,
  PermissionsResponse,
} from '@sigip/shared';
import {
  toPermissionDetailsResponse,
  toPermissionResponse,
} from './presenters/permission.presenter';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  async findAll(): Promise<PermissionsResponse> {
    const permission = await this.permissionsService.findAll();

    return permission.map(toPermissionResponse);
  }

  @Get(':id')
  async findById(
    @Param() params: PermissionIdParamDto,
  ): Promise<PermissionDetailsResponse> {
    const permission = await this.permissionsService.findById(params.id);

    return toPermissionDetailsResponse(permission);
  }

  @Post()
  async create(@Body() dto: CreatePermissionDto): Promise<PermissionResponse> {
    const permission = await this.permissionsService.create(dto);

    return toPermissionResponse(permission);
  }

  @Patch(':id')
  async update(
    @Param() params: PermissionIdParamDto,
    @Body() dto: UpdatePermissionDto,
  ): Promise<PermissionResponse> {
    const permission = await this.permissionsService.update(params.id, dto);

    return toPermissionResponse(permission);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param() params: PermissionIdParamDto) {
    return this.permissionsService.delete(params.id);
  }
}
