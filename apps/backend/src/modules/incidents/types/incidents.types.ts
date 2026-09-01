import type { IncidentStatus } from '@sigip/shared';

export interface IncidentFilters {
  page: number;
  limit: number;
  search?: string;
  status?: IncidentStatus;
  employeeId?: string;
  incidentTypeId?: string;
  organizationalUnitId?: string;
  from?: Date;
  to?: Date;
  officeId?: string;
}

export interface IncidentOccurrenceData {
  id: string;
  startDate: Date;
  endDate: Date | null;
}

export interface CreateIncidentData {
  incident: {
    id: string;
    employeeId: string;
    employeeAssignmentId: string;
    incidentTypeId: string;
    issuedDate: Date | null;
    receivedAt: Date;
    referenceYear: number | null;
    observations: string | null;
    registeredBy: string;
  };
  occurrences: IncidentOccurrenceData[];
  officeId?: string;
  documents: Array<{
    id: string;
    documentTypeId: string;
    originalName: string;
    storedName: string;
    storagePath: string;
    mimeType: string;
    sizeBytes: number;
    contentHash: string;
    uploadedBy: string;
  }>;
  audit: {
    userId: string;
    sessionId: string;
  };
  control: {
    incidentTypeCode: string;
  };
}

export interface UpdateIncidentData {
  expectedUpdatedAt: Date;
  incidentTypeId?: string;
  issuedDate?: Date | null;
  receivedAt?: Date;
  referenceYear?: number | null;
  observations?: string | null;
  occurrences?: IncidentOccurrenceData[];
  updatedBy: string;
  updatedAt: Date;
  sessionId: string;
  officeId?: string;
  control: {
    employeeId: string;
    incidentTypeCode: string;
  };
}

export interface CancelIncidentData {
  cancelledAt: Date;
  cancelledBy: string;
  cancellationReason: string;
  updatedAt: Date;
  sessionId: string;
  officeId?: string;
}

export interface IncidentCreationContext {
  employee: {
    id: string;
    status: string;
    hireDate: Date | null;
  } | null;
  assignment: {
    id: string;
    employeeId: string;
    appointmentType: string;
    effectiveFrom: Date;
    effectiveTo: Date | null;
  } | null;
  incidentType: {
    id: string;
    code: string;
    temporalMode: 'SINGLE_DATE' | 'MULTIPLE_DATES' | 'DATE_RANGE';
    appointmentScope: 'ALL' | 'BASE' | 'CONFIANZA';
    isActive: boolean;
  } | null;
  formDocumentType: {
    id: string;
  } | null;
  commissionDocumentType: {
    id: string;
  } | null;
}
