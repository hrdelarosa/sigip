import type {
  CreateIncidentTypeRequest,
  IncidentAppointmentScope,
  IncidentTemporalMode,
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

export class CreateIncidentTypeDto implements CreateIncidentTypeRequest {
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/)
  code!: string;

  @IsString()
  @MaxLength(150)
  @Matches(/\S/, { message: 'El nombre no puede contener solo espacios' })
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsIn(INCIDENT_TEMPORAL_MODES)
  temporalMode!: IncidentTemporalMode;

  @IsIn(INCIDENT_APPOINTMENT_SCOPES)
  appointmentScope!: IncidentAppointmentScope;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
