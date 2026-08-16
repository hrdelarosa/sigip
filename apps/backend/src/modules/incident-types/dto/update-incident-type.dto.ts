import type {
  IncidentAppointmentScope,
  IncidentTemporalMode,
  UpdateIncidentTypeRequest,
} from '@sigip/shared';

import {
  INCIDENT_APPOINTMENT_SCOPES,
  INCIDENT_TEMPORAL_MODES,
} from '@sigip/shared';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateIncidentTypeDto implements UpdateIncidentTypeRequest {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/\S/, { message: 'El nombre no puede contener solo espacios' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsIn(INCIDENT_TEMPORAL_MODES)
  temporalMode?: IncidentTemporalMode;

  @IsOptional()
  @IsIn(INCIDENT_APPOINTMENT_SCOPES)
  appointmentScope?: IncidentAppointmentScope;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
