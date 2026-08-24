import type { ReportPeriodType } from '@sigip/shared';

export interface ReportDatePeriodModel {
  type: ReportPeriodType;
  startDate: Date;
  endDate: Date;
  label: string;
}

export interface ReportOccurrenceModel {
  startDate: Date;
  endDate: Date | null;
}

export interface ReportIncidentModel {
  incidentId: string;
  employee: {
    id: string;
    employeeNumber: string;
    fullName: string;
  };
  organizationalUnit: {
    id: string;
    name: string;
  };
  position: {
    id: string;
    name: string;
  };
  incidentType: {
    id: string;
    code: string;
    name: string;
  };
  occurrences: ReportOccurrenceModel[];
  issuedDate: Date | null;
  receivedAt: Date;
  status: 'REGISTERED' | 'CANCELLED';
  observations: string | null;
}

export interface IncidentsReportModel {
  period: ReportDatePeriodModel;
  filters?: {
    incidentTypeId?: string;
    organizationalUnitId?: string;
    includeCancelled: boolean;
  };
  summary: {
    totalIncidents: number;
    totalEmployees: number;
    registeredIncidents: number;
    cancelledIncidents: number;
    averageIncidentsPerEmployee: number;
    byType: Array<{
      incidentTypeId: string;
      code: string;
      name: string;
      count: number;
      percentage: number;
    }>;
    byOrganizationalUnit: Array<{
      organizationalUnitId: string;
      name: string;
      count: number;
      percentage: number;
    }>;
  };
  items: ReportIncidentModel[];
}
