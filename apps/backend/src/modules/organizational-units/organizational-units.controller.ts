import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { OrganizationalUnitsService } from './organizational-units.service';
import { CreateOrganizationalUnitDto } from './dto/create-organizational-unit.dto';
import { UpdateOrganizationalUnitDto } from './dto/update-organizational-unit.dto';
import { UpdateOrganizationalUnitStatusDto } from './dto/update-organizational-unit-status.dto';
import { toOrganizationalUnitsResponse } from './presenters/organizational-units.presenter';
import {
  OrganizationalUnitResponse,
  OrganizationalUnitsResponse,
} from '@sigip/shared';

@Controller('organizational-units')
export class OrganizationalUnitsController {
  constructor(
    private readonly organizationalUnitsService: OrganizationalUnitsService,
  ) {}

  @Get()
  async findAll(): Promise<OrganizationalUnitsResponse> {
    const organizationalUnits = await this.organizationalUnitsService.findAll();

    return organizationalUnits.map(toOrganizationalUnitsResponse);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<OrganizationalUnitResponse> {
    const organizationalUnit =
      await this.organizationalUnitsService.findById(id);

    return toOrganizationalUnitsResponse(organizationalUnit);
  }

  @Post()
  async create(
    @Body() dto: CreateOrganizationalUnitDto,
  ): Promise<OrganizationalUnitResponse> {
    const organizationalUnit =
      await this.organizationalUnitsService.create(dto);

    return toOrganizationalUnitsResponse(organizationalUnit);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationalUnitDto,
  ): Promise<OrganizationalUnitResponse> {
    const updatedOrganizationalUnit =
      await this.organizationalUnitsService.update(id, dto);

    return toOrganizationalUnitsResponse(updatedOrganizationalUnit);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationalUnitStatusDto,
  ): Promise<OrganizationalUnitResponse> {
    const updatedOrganizationalUnit =
      await this.organizationalUnitsService.updateStatus(id, dto);

    return toOrganizationalUnitsResponse(updatedOrganizationalUnit);
  }
}
