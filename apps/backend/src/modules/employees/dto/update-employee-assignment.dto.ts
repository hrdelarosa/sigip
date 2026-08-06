import type { UpdateEmployeeAssignmentRequest } from '@sigip/shared';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { AppointmentType } from '../../../database/schema/organization/employee-assignments.schema';

export class UpdateEmployeeAssignmentDto implements UpdateEmployeeAssignmentRequest {
  @IsOptional()
  @IsUUID()
  organizationalUnitId?: string;

  @IsOptional()
  @IsUUID()
  positionId?: string;

  @IsOptional()
  @IsIn(['BASE', 'CONFIANZA'] satisfies AppointmentType[])
  appointmentType?: AppointmentType;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  schedule?: string | null;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string | null;
}
