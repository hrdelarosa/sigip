import type { VacationsReportResponse } from '@sigip/shared';

export type VacationsReportModel = VacationsReportResponse;

export interface VacationReportEmployeeRecord {
  id: string;
  employeeNumber: string;
  fullName: string;
  officeId: string;
  officeName: string;
  hireDate: Date | null;
}

export interface VacationReportIncidentRecord {
  employeeId: string;
  code: string;
  referenceYear: number | null;
  date: Date;
}

export interface VacationReportAdjustmentRecord {
  employeeId: string;
  year: number;
  period: 'FIRST' | 'SECOND';
  daysDelta: number;
}
