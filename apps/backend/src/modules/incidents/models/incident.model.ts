import type { IncidentStatus } from '@sigip/shared';
import type { IncidentOccurrenceModel } from './incident-occurrence.model';

export interface IncidentModel {
  id: string;
  employeeId: string;
  employeeAssignmentId: string | null;
  incidentTypeId: string;
  issuedDate: Date | null;
  receivedAt: Date;
  referenceYear: number | null;
  observations: string | null;
  status: IncidentStatus;
  registeredBy: string;
  updatedBy: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentDetailsModel extends IncidentModel {
  employee: {
    id: string;
    employeeNumber: string;
    fullName: string;
  };
  assignment: {
    id: string;
    appointmentType: string;
    schedule: string | null;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    organizationalUnit: {
      id: string;
      code: string;
      name: string;
    };
    position: {
      id: string;
      code: string;
      name: string;
    };
  } | null;
  incidentType: {
    id: string;
    code: string;
    name: string;
    temporalMode: 'SINGLE_DATE' | 'MULTIPLE_DATES' | 'DATE_RANGE';
    appointmentScope: 'ALL' | 'BASE' | 'CONFIANZA';
  };
  occurrences: IncidentOccurrenceModel[];
  registeredByUser: {
    id: string;
    username: string;
    fullName: string;
  };
}
