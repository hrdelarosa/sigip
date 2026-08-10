import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { OrganizationalUnitsService } from './organizational-units.service';
import { CreateOrganizationalUnitDto } from './dto/create-organizational-unit.dto';
import { UpdateOrganizationalUnitDto } from './dto/update-organizational-unit.dto';
import { UpdateOrganizationalUnitStatusDto } from './dto/update-organizational-unit-status.dto';
import { toOrganizationalUnitsResponse } from './presenters/organizational-units.presenter';
import {
  OrganizationalUnitResponse,
  OrganizationalUnitsResponse,
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
import { OrganizationalUnitApiResponse } from '../../common/swagger/api.models';

@Controller('organizational-units')
@ApiTags('Organizational units')
export class OrganizationalUnitsController {
  constructor(
    private readonly organizationalUnitsService: OrganizationalUnitsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar unidades organizativas' })
  @ApiOkResponse({ type: OrganizationalUnitApiResponse, isArray: true })
  async findAll(): Promise<OrganizationalUnitsResponse> {
    const organizationalUnits = await this.organizationalUnitsService.findAll();

    return organizationalUnits.map(toOrganizationalUnitsResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una unidad organizativa por ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: OrganizationalUnitApiResponse })
  @ApiNotFoundResponse({ description: 'Unidad organizativa no encontrada' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<OrganizationalUnitResponse> {
    const organizationalUnit =
      await this.organizationalUnitsService.findById(id);

    return toOrganizationalUnitsResponse(organizationalUnit);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una unidad organizativa' })
  @ApiCreatedResponse({ type: OrganizationalUnitApiResponse })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async create(
    @Body() dto: CreateOrganizationalUnitDto,
  ): Promise<OrganizationalUnitResponse> {
    const organizationalUnit =
      await this.organizationalUnitsService.create(dto);

    return toOrganizationalUnitsResponse(organizationalUnit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una unidad organizativa' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: OrganizationalUnitApiResponse })
  @ApiNotFoundResponse({ description: 'Unidad organizativa no encontrada' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationalUnitDto,
  ): Promise<OrganizationalUnitResponse> {
    const updatedOrganizationalUnit =
      await this.organizationalUnitsService.update(id, dto);

    return toOrganizationalUnitsResponse(updatedOrganizationalUnit);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activar o desactivar una unidad organizativa' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: OrganizationalUnitApiResponse })
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationalUnitStatusDto,
  ): Promise<OrganizationalUnitResponse> {
    const updatedOrganizationalUnit =
      await this.organizationalUnitsService.updateStatus(id, dto);

    return toOrganizationalUnitsResponse(updatedOrganizationalUnit);
  }
}
