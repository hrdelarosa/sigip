import type { CreateEmployeeAssignmentRequest } from '@sigip/shared';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
} from 'class-validator';
import type { AppointmentType } from '../../../database/schema/organization/employee-assignments.schema';
import { trimNullableString, trimString } from './employee-dto.transforms';

export class CreateEmployeeAssignmentDto implements CreateEmployeeAssignmentRequest {
  @IsUUID()
  organizationalUnitId!: string;

  @IsUUID()
  positionId!: string;

  @IsIn(['BASE', 'CONFIANZA'] satisfies AppointmentType[])
  appointmentType!: AppointmentType;

  @IsOptional()
  @Transform(trimNullableString)
  @IsString()
  @MaxLength(150)
  schedule?: string | null;

  @Transform(trimString)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  effectiveFrom!: string;

  @IsOptional()
  @Transform(trimString)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  effectiveTo?: string | null;

  @IsOptional()
  @Transform(trimNullableString)
  @IsString()
  @MaxLength(5000)
  notes?: string | null;
}
