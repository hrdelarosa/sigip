import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import type { PositionResponse, PositionsResponse } from '@sigip/shared';
import { toPositionResponse } from './presenters/position.presenter';
import { UpdatePositionStatusDto } from './dto/update-position-status.dto';
import { PositionIdParamDto } from './dto/position-id-param.dto';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async findAll(): Promise<PositionsResponse> {
    const position = await this.positionsService.findAll();

    return position.map(toPositionResponse);
  }

  @Get(':id')
  async findById(
    @Param() params: PositionIdParamDto,
  ): Promise<PositionResponse> {
    const position = await this.positionsService.findById(params.id);

    return toPositionResponse(position);
  }

  @Post()
  async create(@Body() dto: CreatePositionDto): Promise<PositionResponse> {
    const position = await this.positionsService.create(dto);

    return toPositionResponse(position);
  }

  @Patch(':id')
  async update(
    @Param() params: PositionIdParamDto,
    @Body() dto: UpdatePositionDto,
  ): Promise<PositionResponse> {
    const position = await this.positionsService.update(params.id, dto);

    return toPositionResponse(position);
  }

  @Patch(':id/status')
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
