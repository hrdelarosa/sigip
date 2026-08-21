import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type { ReportFortnightOption, ReportPeriodType } from '@sigip/shared';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class GetIncidentsReportDto {
  @IsIn(['FORTNIGHT', 'MONTH', 'YEAR', 'CUSTOM'])
  period!: ReportPeriodType;

  @IsOptional()
  @IsIn(['FIRST', 'SECOND'])
  fortnight?: ReportFortnightOption;

  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
  @Transform(({ value }) => toOptionalNumber(value))
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Matches(ISO_DATE_PATTERN, {
    message: 'startDate debe tener formato YYYY-MM-DD.',
  })
  startDate?: string;

  @IsOptional()
  @Matches(ISO_DATE_PATTERN, {
    message: 'endDate debe tener formato YYYY-MM-DD.',
  })
  endDate?: string;

  @IsOptional()
  @IsUUID()
  incidentTypeId?: string;

  @IsOptional()
  @IsUUID()
  organizationalUnitId?: string;

  @IsOptional()
  @Transform(({ value }) => parseOptionalBoolean(value))
  @IsBoolean()
  includeCancelled = false;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseOptionalBoolean(value: unknown): unknown {
  if (value === true || value === false) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}
