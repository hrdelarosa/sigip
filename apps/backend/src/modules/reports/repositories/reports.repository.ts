import type { ReportIncidentModel } from '../models/incidents-report.model';

export interface FindIncidentReportOptions {
  startDate: Date;
  endDate: Date;
  incidentTypeId?: string;
  organizationalUnitId?: string;
  includeCancelled: boolean;
  officeId?: string;
}

export abstract class ReportsRepository {
  abstract findIncidents(
    options: FindIncidentReportOptions,
  ): Promise<ReportIncidentModel[]>;
}
