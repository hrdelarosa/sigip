import type { CancelIncidentRequest } from '@sigip/shared';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CancelIncidentDto implements CancelIncidentRequest {
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  @Matches(/\S/, { message: 'El motivo no puede contener solo espacios' })
  reason!: string;
}
