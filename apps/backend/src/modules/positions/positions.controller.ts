import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponse, PositionsResponse } from '@sigip/shared';
import { toPositionResponse } from './presenters/position.presenter';
import { UpdatePositionStatusDto } from './dto/update-position-status.dto';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async findAll(): Promise<PositionsResponse> {
    const position = await this.positionsService.findAll();

    return position.map(toPositionResponse);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PositionResponse> {
    const position = await this.positionsService.findById(id);

    return toPositionResponse(position);
  }

  @Post()
  async create(@Body() dto: CreatePositionDto): Promise<PositionResponse> {
    const position = await this.positionsService.create(dto);

    return toPositionResponse(position);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePositionDto,
  ): Promise<PositionResponse> {
    const position = await this.positionsService.update(id, dto);

    return toPositionResponse(position);
  }

  @Delete(':id')
  async updateStatus(
    @Param('id') id: string,
    dto: UpdatePositionStatusDto,
  ): Promise<PositionResponse> {
    const updatePosition = await this.positionsService.updateStatus(id, dto);

    return toPositionResponse(updatePosition);
  }
}
