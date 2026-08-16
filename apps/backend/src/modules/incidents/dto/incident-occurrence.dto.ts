import { IsDateString, IsOptional } from 'class-validator';

export class IncidentOccurrenceDto {
  @IsDateString()
  startDate!: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}
