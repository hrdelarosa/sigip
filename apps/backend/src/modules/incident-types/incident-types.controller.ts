import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type {
  IncidentTypeResponse,
  IncidentTypesResponse,
} from '@sigip/shared';

import { CreateIncidentTypeDto } from './dto/create-incident-type.dto';
import { IncidentTypeIdParamDto } from './dto/incident-type-id-param.dto';
import { ListIncidentTypesQueryDto } from './dto/list-incident-types-query.dto';
import { UpdateIncidentTypeDto } from './dto/update-incident-type.dto';
import { UpdateIncidentTypeStatusDto } from './dto/update-incident-type-status.dto';
import { IncidentTypesService } from './incident-types.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { toPaginatedResponse } from '../../common/pagination/presenters/pagination.presenter';
import { toIncidentTypeResponse } from './presenters/incident-type.presenter';

@Controller('incident-types')
@RequirePermissions('catalogs:read')
export class IncidentTypesController {
  constructor(private readonly service: IncidentTypesService) {}

  @Get()
  async findAll(
    @Query()
    query: ListIncidentTypesQueryDto,
  ): Promise<IncidentTypesResponse> {
    const result = await this.service.findAll(query);

    return toPaginatedResponse(
      result.items,
      result.total,
      query.page,
      query.limit,
      toIncidentTypeResponse,
    );
  }

  @Get(':id')
  async findById(
    @Param()
    params: IncidentTypeIdParamDto,
  ): Promise<IncidentTypeResponse> {
    return toIncidentTypeResponse(await this.service.findById(params.id));
  }

  @Post()
  @RequirePermissions('catalogs:update')
  async create(
    @Body()
    dto: CreateIncidentTypeDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<IncidentTypeResponse> {
    return toIncidentTypeResponse(await this.service.create(dto, actor));
  }

  @Patch(':id')
  @RequirePermissions('catalogs:update')
  async update(
    @Param()
    params: IncidentTypeIdParamDto,

    @Body()
    dto: UpdateIncidentTypeDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<IncidentTypeResponse> {
    return toIncidentTypeResponse(
      await this.service.update(params.id, dto, actor),
    );
  }

  @Patch(':id/status')
  @RequirePermissions('catalogs:update')
  async updateStatus(
    @Param()
    params: IncidentTypeIdParamDto,

    @Body()
    dto: UpdateIncidentTypeStatusDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<IncidentTypeResponse> {
    return toIncidentTypeResponse(
      await this.service.updateStatus(params.id, dto, actor),
    );
  }
}
