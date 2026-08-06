import type { AppointmentType } from '../../../database/schema/organization/employee-assignments.schema';
import type { OrganizationalUnitsModel } from '../../organizational-units/models/organizational-units.model';
import type { PositionModel } from '../../positions/models/position.model';

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

export interface EmployeeAssignmenDetailsModel extends EmployeeAssignmentModel {
  organizationalUnit: OrganizationalUnitsModel;
  position: PositionModel;
}
