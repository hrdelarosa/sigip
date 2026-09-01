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
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';

@Controller('organizational-units')
@ApiTags('Organizational units')
@RequirePermissions('catalogs:read')
export class OrganizationalUnitsController {
  constructor(
    private readonly organizationalUnitsService: OrganizationalUnitsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar unidades organizativas' })
  @ApiOkResponse({ type: OrganizationalUnitApiResponse, isArray: true })
  async findAll(
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<OrganizationalUnitsResponse> {
    const organizationalUnits =
      await this.organizationalUnitsService.findAll(actor);

    return organizationalUnits.map(toOrganizationalUnitsResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una unidad organizativa por ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: OrganizationalUnitApiResponse })
  @ApiNotFoundResponse({ description: 'Unidad organizativa no encontrada' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<OrganizationalUnitResponse> {
    const organizationalUnit = await this.organizationalUnitsService.findById(
      id,
      actor,
    );

    return toOrganizationalUnitsResponse(organizationalUnit);
  }

  @Post()
  @RequirePermissions('catalogs:update')
  @ApiOperation({ summary: 'Crear una unidad organizativa' })
  @ApiCreatedResponse({ type: OrganizationalUnitApiResponse })
  @ApiBadRequestResponse({ description: 'Datos de entrada inválidos' })
  async create(
    @Body() dto: CreateOrganizationalUnitDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<OrganizationalUnitResponse> {
    const organizationalUnit = await this.organizationalUnitsService.create(
      dto,
      actor,
    );

    return toOrganizationalUnitsResponse(organizationalUnit);
  }

  @Patch(':id')
  @RequirePermissions('catalogs:update')
  @ApiOperation({ summary: 'Actualizar una unidad organizativa' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: OrganizationalUnitApiResponse })
  @ApiNotFoundResponse({ description: 'Unidad organizativa no encontrada' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationalUnitDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<OrganizationalUnitResponse> {
    const updatedOrganizationalUnit =
      await this.organizationalUnitsService.update(id, dto, actor);

    return toOrganizationalUnitsResponse(updatedOrganizationalUnit);
  }

  @Patch(':id/status')
  @RequirePermissions('catalogs:update')
  @ApiOperation({ summary: 'Activar o desactivar una unidad organizativa' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: OrganizationalUnitApiResponse })
  async updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateOrganizationalUnitStatusDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<OrganizationalUnitResponse> {
    const updatedOrganizationalUnit =
      await this.organizationalUnitsService.updateStatus(id, dto, actor);

    return toOrganizationalUnitsResponse(updatedOrganizationalUnit);
  }
}
