import type { DocumentModel } from '../models/document.model';

export abstract class DocumentsRepository {
  abstract findByIncidentId(
    incidentId: string,
    officeId?: string,
  ): Promise<DocumentModel[]>;
  abstract findById(
    id: string,
    officeId?: string,
  ): Promise<DocumentModel | null>;
  abstract create(data: {
    id: string;
    incidentId: string;
    documentTypeId: string;
    originalName: string;
    storedName: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
    contentHash: string;
    uploadedBy: string;
  }): Promise<DocumentModel>;
  abstract createCommissionAnnex(data: {
    id: string;
    incidentId: string;
    originalName: string;
    storedName: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
    contentHash: string;
    uploadedBy: string;
    sessionId: string;
    officeId?: string;
  }): Promise<DocumentModel>;
  abstract softDelete(
    id: string,
    data: {
      deletedAt: Date;
      deletedBy: string;
      deletionReason: string;
      sessionId: string;
      officeId?: string;
    },
  ): Promise<DocumentModel | null>;
}
