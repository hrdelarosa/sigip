export interface DocumentModel {
  id: string;
  incidentId: string;
  documentType: {
    id: string;
    code: string;
    name: string;
    description: string | null;
    isActive: boolean;
  };
  originalName: string;
  storedName: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  contentHash: string | null;
  uploadedBy: string;
  createdAt: Date;
  deletedAt: Date | null;
  deletedBy: string | null;
  deletionReason: string | null;
}
