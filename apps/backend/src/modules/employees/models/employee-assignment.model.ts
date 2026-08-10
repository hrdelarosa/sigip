import type { AppointmentType } from '../../../database/schema/organization/employee-assignments.schema';
export interface EmployeeAssignmentModel {
  id: string;
  employeeId: string;
  organizationalUnitId: string;
  positionId: string;
  appointmentType: AppointmentType;
  schedule: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeAssignmentCatalogSummaryModel {
  id: string;
  code: string;
  name: string;
}

export interface EmployeeAssignmentDetailsModel extends EmployeeAssignmentModel {
  organizationalUnit: EmployeeAssignmentCatalogSummaryModel;
  position: EmployeeAssignmentCatalogSummaryModel;
}
