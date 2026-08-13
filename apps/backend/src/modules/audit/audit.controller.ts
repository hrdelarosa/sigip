import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { AuditLogResponse, AuditLogsResponse } from '@sigip/shared';

import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { toPaginatedResponse } from '../../common/pagination/presenters/pagination.presenter';
import { AuditService } from './audit.service';
import { AuditIdParamDto } from './dto/audit-id-param.dto';
import { ListAuditQueryDto } from './dto/list-audit-query.dto';
import { toAuditLogResponse } from './presenters/audit.presenter';

@Controller('audit')
@ApiTags('Audit')
@RequirePermissions('audit:read')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'Listar registros de auditoría' })
  @ApiOkResponse({ description: 'Registros de auditoría paginados' })
  async findAll(@Query() query: ListAuditQueryDto): Promise<AuditLogsResponse> {
    const result = await this.auditService.findAll(query);

    return toPaginatedResponse(
      result.items,
      result.total,
      query.page,
      query.limit,
      toAuditLogResponse,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de auditoría' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ description: 'Detalle del registro de auditoría' })
  @ApiNotFoundResponse({ description: 'Registro de auditoría no encontrado' })
  async findById(@Param() params: AuditIdParamDto): Promise<AuditLogResponse> {
    return toAuditLogResponse(await this.auditService.findById(params.id));
  }
}
