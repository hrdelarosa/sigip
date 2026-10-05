import type { ReportIncidentModel } from '../models/incidents-report.model';
import type {
  VacationReportAdjustmentRecord,
  VacationReportEmployeeRecord,
  VacationReportIncidentRecord,
} from '../models/vacations-report.model';

export interface FindIncidentReportOptions {
  startDate: Date;
  endDate: Date;
  incidentTypeId?: string;
  includeCancelled: boolean;
  officeId?: string;
}

export abstract class ReportsRepository {
  abstract findIncidents(
    options: FindIncidentReportOptions,
  ): Promise<ReportIncidentModel[]>;

  abstract findVacationEmployees(
    officeId?: string,
  ): Promise<VacationReportEmployeeRecord[]>;

  abstract findVacationIncidents(
    employeeIds: string[],
    year: number,
    officeId?: string,
  ): Promise<VacationReportIncidentRecord[]>;

  abstract findVacationAdjustments(
    employeeIds: string[],
    year: number,
  ): Promise<VacationReportAdjustmentRecord[]>;
}
