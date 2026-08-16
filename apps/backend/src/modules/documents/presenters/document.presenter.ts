import type { IncidentDocumentResponse } from '@sigip/shared';
import type { DocumentModel } from '../models/document.model';

export function toDocumentResponse(
  model: DocumentModel,
): IncidentDocumentResponse {
  return {
    id: model.id,
    incidentId: model.incidentId,
    documentType: {
      id: model.documentType.id,
      code: model.documentType.code,
      name: model.documentType.name,
      description: model.documentType.description,
      isActive: model.documentType.isActive,
    },
    originalName: model.originalName,
    mimeType: model.mimeType,
    sizeBytes: model.sizeBytes,
    createdAt: model.createdAt.toISOString(),
    deletedAt: model.deletedAt?.toISOString() ?? null,
  };
}
