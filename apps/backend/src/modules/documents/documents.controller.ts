import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import type { IncidentDocumentsResponse } from '@sigip/shared';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { DeleteDocumentDto } from './dto/delete-document.dto';
import { DocumentIdParamDto } from './dto/document-id-param.dto';
import { IncidentDocumentIdParamDto } from './dto/incident-document-id-param.dto';
import { DocumentsService } from './documents.service';
import { toDocumentResponse } from './presenters/document.presenter';
import type { UploadedMemoryFile } from '../../common/types/uploaded-memory-file.type';

const MAX_COMMISSION_ANNEX_SIZE = 5 * 1024 * 1024;

@Controller()
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @Get('incidents/:incidentId/documents')
  @RequirePermissions('documents:read')
  async findByIncident(
    @Param()
    params: IncidentDocumentIdParamDto,
  ): Promise<IncidentDocumentsResponse> {
    const documents = await this.service.findByIncidentId(params.incidentId);

    return documents.map(toDocumentResponse);
  }

  @Post('incidents/:incidentId/documents')
  @RequirePermissions('documents:create')
  @UseInterceptors(
    FileInterceptor('file', {
      defParamCharset: 'utf8',
      limits: { fileSize: MAX_COMMISSION_ANNEX_SIZE, files: 1, fields: 0 },
    }),
  )
  async uploadCommissionAnnex(
    @Param() params: IncidentDocumentIdParamDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_COMMISSION_ANNEX_SIZE }),
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
        fileIsRequired: true,
      }),
    )
    file: UploadedMemoryFile,
    @CurrentUser() actor: AuthenticatedUserModel,
  ) {
    if (!file.originalname.trim() || file.originalname.length > 255) {
      throw new BadRequestException(
        'El oficio de comisión tiene un nombre de archivo inválido',
      );
    }
    return toDocumentResponse(
      await this.service.uploadCommissionAnnex(params.incidentId, file, actor),
    );
  }

  @Get('documents/:id')
  @RequirePermissions('documents:read')
  async getContent(
    @Param()
    params: DocumentIdParamDto,

    @Res()
    response: Response,
  ) {
    const { buffer, document } = await this.service.getContent(params.id);

    response.setHeader('Content-Type', document.mimeType);
    response.setHeader('Content-Length', String(buffer.length));
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Cache-Control', 'private, no-store');

    const encodedName = encodeRfc8187(document.originalName);
    const fallbackName = toAsciiFilename(document.originalName);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodedName}`,
    );

    response.send(buffer);
  }

  @Delete('documents/:id')
  @RequirePermissions('documents:delete')
  async delete(
    @Param()
    params: DocumentIdParamDto,

    @Body()
    dto: DeleteDocumentDto,

    @CurrentUser()
    actor: AuthenticatedUserModel,
  ) {
    return toDocumentResponse(await this.service.delete(params.id, dto, actor));
  }
}

function encodeRfc8187(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function toAsciiFilename(value: string): string {
  const filename = value
    .normalize('NFKD')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/["\\]/g, '_')
    .trim();

  return filename || 'documento.pdf';
}
