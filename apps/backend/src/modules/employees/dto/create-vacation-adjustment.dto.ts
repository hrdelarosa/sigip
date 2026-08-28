import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotIn,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { VACATION_PERIODS, type VacationPeriod } from '@sigip/shared';

export class CreateVacationAdjustmentDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year!: number;

  @IsIn(VACATION_PERIODS)
  period!: VacationPeriod;

  @Type(() => Number)
  @IsInt()
  @Min(-10)
  @Max(10)
  @IsNotIn([0])
  daysDelta!: number;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MinLength(3)
  @MaxLength(500)
  reason!: string;
}
