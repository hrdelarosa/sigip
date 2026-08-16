export interface DocumentTypeResponse {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
}

export interface IncidentDocumentResponse {
  id: string
  incidentId: string
  documentType: DocumentTypeResponse
  originalName: string
  mimeType: string
  sizeBytes: number
  createdAt: string
  deletedAt: string | null
}

export type IncidentDocumentsResponse = IncidentDocumentResponse[]

export interface DeleteDocumentRequest {
  reason: string
}
