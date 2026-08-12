import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import type {
  PositionDetailsResponse,
  PositionResponse,
  PositionsResponse,
} from '@sigip/shared';
import {
  toPositionDetailsResponse,
  toPositionResponse,
} from './presenters/position.presenter';
import { UpdatePositionStatusDto } from './dto/update-position-status.dto';
import { PositionIdParamDto } from './dto/position-id-param.dto';
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
  PositionApiResponse,
  PositionDetailsApiResponse,
} from '../../common/swagger/api.models';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@Controller('positions')
@ApiTags('Positions')
@RequirePermissions('catalogs:read')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar puestos' })
  @ApiOkResponse({ type: PositionApiResponse, isArray: true })
  async findAll(): Promise<PositionsResponse> {
    const position = await this.positionsService.findAll();

    return position.map(toPositionResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un puesto por ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PositionDetailsApiResponse })
  @ApiNotFoundResponse({ description: 'Puesto no encontrado' })
  async findById(
    @Param() params: PositionIdParamDto,
  ): Promise<PositionDetailsResponse> {
    const position = await this.positionsService.findById(params.id);

    return toPositionDetailsResponse(position);
  }

  @Post()
  @RequirePermissions('catalogs:update')
  @ApiOperation({ summary: 'Crear un puesto' })
  @ApiCreatedResponse({ type: PositionApiResponse })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async create(@Body() dto: CreatePositionDto): Promise<PositionResponse> {
    const position = await this.positionsService.create(dto);

    return toPositionResponse(position);
  }

  @Patch(':id')
  @RequirePermissions('catalogs:update')
  @ApiOperation({ summary: 'Actualizar un puesto' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PositionApiResponse })
  @ApiNotFoundResponse({ description: 'Puesto no encontrado' })
  async update(
    @Param() params: PositionIdParamDto,
    @Body() dto: UpdatePositionDto,
  ): Promise<PositionResponse> {
    const position = await this.positionsService.update(params.id, dto);

    return toPositionResponse(position);
  }

  @Patch(':id/status')
  @RequirePermissions('catalogs:update')
  @ApiOperation({ summary: 'Activar o desactivar un puesto' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: PositionApiResponse })
  async updateStatus(
    @Param() params: PositionIdParamDto,
    @Body() dto: UpdatePositionStatusDto,
  ): Promise<PositionResponse> {
    const updatePosition = await this.positionsService.updateStatus(
      params.id,
      dto,
    );

    return toPositionResponse(updatePosition);
  }
}
