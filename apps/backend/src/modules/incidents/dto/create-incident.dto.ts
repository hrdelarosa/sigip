import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { CreateIncidentRequest } from '@sigip/shared';
import { IncidentOccurrenceDto } from './incident-occurrence.dto';

export class CreateIncidentDto implements CreateIncidentRequest {
  @IsUUID()
  employeeId!: string;

  @IsOptional()
  @IsUUID()
  employeeAssignmentId?: string | null;

  @IsUUID()
  incidentTypeId!: string;

  @IsOptional()
  @IsDateString()
  issuedDate?: string | null;

  @IsDateString()
  receivedAt!: string;

  @IsOptional()
  @IsInt()
  @Min(2000)
  @Max(2100)
  referenceYear?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  observations?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(366)
  @ValidateNested({
    each: true,
  })
  @Type(() => IncidentOccurrenceDto)
  occurrences!: IncidentOccurrenceDto[];
}
