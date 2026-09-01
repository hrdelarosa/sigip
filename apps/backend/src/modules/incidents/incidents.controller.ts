import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { IncidentResponse, IncidentsResponse } from '@sigip/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { toPaginatedResponse } from '../../common/pagination/presenters/pagination.presenter';
import { ParseJsonDtoPipe } from '../../common/pipes/parse-json-dto.pipe';
import { CancelIncidentDto } from './dto/cancel-incident.dto';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentIdParamDto } from './dto/incident-id-param.dto';
import { ListIncidentsQueryDto } from './dto/list-incidents-query.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';
import { IncidentsService } from './incidents.service';
import { toIncidentResponse } from './presenters/incident.presenter';
import type { UploadedMemoryFile } from '../../common/types/uploaded-memory-file.type';

const MAX_INCIDENT_FILE_SIZE = 10 * 1024 * 1024;
const MAX_COMMISSION_ANNEX_SIZE = 5 * 1024 * 1024;

type IncidentUploadFiles = {
  file?: UploadedMemoryFile[];
  commissionAnnex?: UploadedMemoryFile[];
};

@Controller('incidents')
@RequirePermissions('incidents:read')
export class IncidentsController {
  constructor(private readonly service: IncidentsService) {}

  @Get()
  async findAll(
    @Query()
    query: ListIncidentsQueryDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<IncidentsResponse> {
    const result = await this.service.findAll(query, actor);

    return toPaginatedResponse(
      result.items,
      result.total,
      query.page,
      query.limit,
      toIncidentResponse,
    );
  }

  @Get(':id')
  async findById(
    @Param()
    params: IncidentIdParamDto,
    @CurrentUser() actor: AuthenticatedUserModel,
  ): Promise<IncidentResponse> {
    return toIncidentResponse(await this.service.findById(params.id, actor));
  }

  @Post()
  @RequirePermissions('incidents:create')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'file', maxCount: 1 },
        { name: 'commissionAnnex', maxCount: 1 },
      ],
      {
        defParamCharset: 'utf8',
        limits: {
          fileSize: MAX_INCIDENT_FILE_SIZE,
          files: 2,
          fields: 1,
        },
      },
    ),
  )
  async create(
    @Body('data')
    data: string,

    @UploadedFiles()
    files: IncidentUploadFiles,

    @CurrentUser()
    actor: AuthenticatedUserModel,
  ): Promise<IncidentResponse> {
    const dto = await new ParseJsonDtoPipe(CreateIncidentDto).transform(data);
    const file = validatePdfUpload(
      files?.file?.[0],
      MAX_INCIDENT_FILE_SIZE,
      true,
      'El formato de incidencia',
    );
    const commissionAnnex = validatePdfUpload(
      files?.commissionAnnex?.[0],
      MAX_COMMISSION_ANNEX_SIZE,
      false,
      'El oficio de comisión',
    );

    return toIncidentResponse(
      await this.service.create(dto, file, actor, commissionAnnex),
    );
  }

  @Patch(':id')
  @RequirePermissions('incidents:update')
  async update(
    @Param()
    params: IncidentIdParamDto,

    @Body()
    dto: UpdateIncidentDto,

    @CurrentUser()
    actor: AuthenticatedUserModel,
  ): Promise<IncidentResponse> {
    return toIncidentResponse(await this.service.update(params.id, dto, actor));
  }

  @Post(':id/cancel')
  @RequirePermissions('incidents:cancel')
  async cancel(
    @Param()
    params: IncidentIdParamDto,

    @Body()
    dto: CancelIncidentDto,

    @CurrentUser()
    actor: AuthenticatedUserModel,
  ): Promise<IncidentResponse> {
    return toIncidentResponse(await this.service.cancel(params.id, dto, actor));
  }
}

function validatePdfUpload(
  file: UploadedMemoryFile | undefined,
  maxSize: number,
  required: true,
  label: string,
): UploadedMemoryFile;
function validatePdfUpload(
  file: UploadedMemoryFile | undefined,
  maxSize: number,
  required: false,
  label: string,
): UploadedMemoryFile | undefined;
function validatePdfUpload(
  file: UploadedMemoryFile | undefined,
  maxSize: number,
  required: boolean,
  label: string,
): UploadedMemoryFile | undefined {
  if (!file) {
    if (required)
      throw new BadRequestException(`${label} en PDF es obligatorio`);
    return undefined;
  }
  if (file.mimetype !== 'application/pdf') {
    throw new BadRequestException(`${label} debe ser un archivo PDF`);
  }
  if (file.size > maxSize) {
    throw new BadRequestException(
      `${label} no puede superar ${maxSize / 1024 / 1024} MB`,
    );
  }
  if (!file.originalname.trim() || file.originalname.length > 255) {
    throw new BadRequestException(
      `${label} tiene un nombre de archivo inválido`,
    );
  }
  return file;
}
