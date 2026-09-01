import { Injectable } from '@nestjs/common';
import type { AuthenticatedUserModel } from '../auth/models/authenticated-user.model';
import { DeleteDocumentDto } from './dto/delete-document.dto';

import {
  DocumentNotFoundError,
  PrimaryIncidentFormCannotBeDeletedError,
} from './documents.errors';
import type { UploadedMemoryFile } from '../../common/types/uploaded-memory-file.type';
import { generateUuidV7 } from '../../common/utils/generate-uuid-v7.util';
import { getOfficeScope } from '../../common/authorization/office-scope';

import { DocumentsRepository } from './repositories/documents.repository';

import { DocumentStorageService } from './storage/document-storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly repository: DocumentsRepository,

    private readonly storage: DocumentStorageService,
  ) {}

  findByIncidentId(incidentId: string, actor: AuthenticatedUserModel) {
    const scope = getOfficeScope(actor);
    return this.repository.findByIncidentId(
      incidentId,
      scope.canAccessAllOffices ? undefined : scope.officeId,
    );
  }

  async findById(id: string, actor: AuthenticatedUserModel) {
    const scope = getOfficeScope(actor);
    const document = await this.repository.findById(
      id,
      scope.canAccessAllOffices ? undefined : scope.officeId,
    );

    if (!document) {
      throw new DocumentNotFoundError(id);
    }

    return document;
  }

  async getContent(id: string, actor: AuthenticatedUserModel) {
    const document = await this.findById(id, actor);

    if (document.deletedAt) {
      throw new DocumentNotFoundError(id);
    }

    const buffer = await this.storage.read(document.storagePath);

    return {
      buffer,
      document,
    };
  }

  async uploadCommissionAnnex(
    incidentId: string,
    file: UploadedMemoryFile,
    actor: AuthenticatedUserModel,
  ) {
    const scope = getOfficeScope(actor);
    const id = generateUuidV7();
    const stored = await this.storage.storeIncidentDocument(
      incidentId,
      id,
      file,
    );

    try {
      return await this.repository.createCommissionAnnex({
        id,
        incidentId,
        originalName: file.originalname,
        storedName: stored.storedName,
        storagePath: stored.storagePath,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        contentHash: stored.contentHash,
        uploadedBy: actor.userId,
        sessionId: actor.sessionId,
        officeId: scope.canAccessAllOffices ? undefined : scope.officeId,
      });
    } catch (error) {
      await this.storage.remove(stored.storagePath).catch(() => undefined);
      throw error;
    }
  }

  async delete(
    id: string,
    dto: DeleteDocumentDto,
    actor: AuthenticatedUserModel,
  ) {
    const scope = getOfficeScope(actor);
    const officeId = scope.canAccessAllOffices ? undefined : scope.officeId;
    const current = await this.findById(id, actor);

    if (current.documentType.code === 'FORMATO_INCIDENCIA') {
      throw new PrimaryIncidentFormCannotBeDeletedError();
    }

    const result = await this.repository.softDelete(id, {
      deletedAt: new Date(),

      deletedBy: actor.userId,

      deletionReason: dto.reason.trim(),
      sessionId: actor.sessionId,
      officeId,
    });

    if (!result) {
      throw new DocumentNotFoundError(id);
    }

    return result;
  }
}
