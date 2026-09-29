import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import type { VacationReportPeriod } from '@sigip/shared';

export class GetVacationsReportDto {
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @IsIn(['FIRST', 'SECOND', 'BOTH'])
  period!: VacationReportPeriod;

  @IsOptional()
  @IsUUID()
  officeId?: string;
}
