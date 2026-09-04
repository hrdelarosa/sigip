import type { UpdateEmployeeAssignmentRequest } from '@sigip/shared';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import type { AppointmentType } from '../../../database/schema/organization/employee-assignments.schema';
import { trimNullableString, trimString } from './employee-dto.transforms';

export class UpdateEmployeeAssignmentDto implements UpdateEmployeeAssignmentRequest {
  @ValidateIf(
    (_object: unknown, value: unknown) => value !== undefined && value !== null,
  )
  @Transform(trimNullableString)
  @IsUUID()
  organizationalUnitId?: string | null;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsUUID()
  positionId?: string;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @IsIn(['BASE', 'CONFIANZA'] satisfies AppointmentType[])
  appointmentType?: AppointmentType;

  @ValidateIf(
    (_object: unknown, value: unknown) => value !== undefined && value !== null,
  )
  @Transform(trimNullableString)
  @IsString()
  @MaxLength(150)
  schedule?: string | null;

  @ValidateIf((_object: unknown, value: unknown) => value !== undefined)
  @Transform(trimString)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  effectiveFrom?: string;

  @ValidateIf(
    (_object: unknown, value: unknown) => value !== undefined && value !== null,
  )
  @Transform(trimString)
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  effectiveTo?: string | null;

  @ValidateIf(
    (_object: unknown, value: unknown) => value !== undefined && value !== null,
  )
  @Transform(trimNullableString)
  @IsString()
  @MaxLength(5000)
  notes?: string | null;
}
