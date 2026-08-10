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
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  PermissionApiResponse,
  PermissionDetailsApiResponse,
} from '../../common/swagger/api.models';

@Controller('permissions')
@ApiTags('Permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar permisos' })
  @ApiOkResponse({ type: PermissionApiResponse, isArray: true })
  async findAll(): Promise<PermissionsResponse> {
    const permission = await this.permissionsService.findAll();

    return permission.map(toPermissionResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un permiso por ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PermissionDetailsApiResponse })
  @ApiNotFoundResponse({ description: 'Permiso no encontrado' })
  async findById(
    @Param() params: PermissionIdParamDto,
  ): Promise<PermissionDetailsResponse> {
    const permission = await this.permissionsService.findById(params.id);

    return toPermissionDetailsResponse(permission);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un permiso' })
  @ApiCreatedResponse({ type: PermissionApiResponse })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async create(@Body() dto: CreatePermissionDto): Promise<PermissionResponse> {
    const permission = await this.permissionsService.create(dto);

    return toPermissionResponse(permission);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un permiso' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PermissionApiResponse })
  @ApiNotFoundResponse({ description: 'Permiso no encontrado' })
  async update(
    @Param() params: PermissionIdParamDto,
    @Body() dto: UpdatePermissionDto,
  ): Promise<PermissionResponse> {
    const permission = await this.permissionsService.update(params.id, dto);

    return toPermissionResponse(permission);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Eliminar un permiso' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Permiso eliminado' })
  @ApiNotFoundResponse({ description: 'Permiso no encontrado' })
  delete(@Param() params: PermissionIdParamDto) {
    return this.permissionsService.delete(params.id);
  }
}
