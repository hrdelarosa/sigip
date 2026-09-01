import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { OfficeResponse, OfficesResponse } from '@sigip/shared';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { OfficeIdParamDto } from './dto/office-id-param.dto';
import { OfficesService } from './offices.service';
import { toOfficeResponse } from './presenters/office.presenter';

@Controller('offices')
@ApiTags('Offices')
@RequirePermissions('catalogs:read')
export class OfficesController {
  constructor(private readonly officesService: OfficesService) {}

  @Get()
  @ApiOkResponse({
    description: 'Listado de oficinas.',
  })
  async findAll(): Promise<OfficesResponse> {
    const offices = await this.officesService.findAll();

    return offices.map(toOfficeResponse);
  }

  @Get(':id')
  @ApiOkResponse({
    description: 'Detalle de oficina.',
  })
  @ApiNotFoundResponse({
    description: 'Oficina no encontrada.',
  })
  async findById(
    @Param()
    params: OfficeIdParamDto,
  ): Promise<OfficeResponse> {
    const office = await this.officesService.findById(params.id);

    return toOfficeResponse(office);
  }
}
