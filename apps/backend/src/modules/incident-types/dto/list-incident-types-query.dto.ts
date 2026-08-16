import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  INCIDENT_APPOINTMENT_SCOPES,
  INCIDENT_TEMPORAL_MODES,
  type IncidentAppointmentScope,
  type IncidentTemporalMode,
} from '@sigip/shared';

export class ListIncidentTypesQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }: { value: string }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsIn(INCIDENT_TEMPORAL_MODES)
  temporalMode?: IncidentTemporalMode;

  @IsOptional()
  @IsIn(INCIDENT_APPOINTMENT_SCOPES)
  appointmentScope?: IncidentAppointmentScope;
}
